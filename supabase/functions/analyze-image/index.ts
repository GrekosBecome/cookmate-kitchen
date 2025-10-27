import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a vision gatekeeper for a cooking app. Analyze images to detect food while being forgiving of typical kitchen photos.

Rules:
- Detect persons/faces. If any person/face is prominent in the image, set person_present=true.
- Detect objects and label whether each is FOOD (true/false).
- Accept photos with food as the main subject, even if hands, utensils, tables, or packaging are visible in the background.
- Provide bounding boxes normalized to image width/height: {x, y, w, h} in [0..1].
- Compute food_coverage = sum of FOOD boxes area (0.0 to 1.0).

Decision Logic:
- REJECT if: (person_present==true AND food_coverage < 0.10) OR no FOOD objects detected at all.
- BORDERLINE if: food_coverage >= 0.10 AND food_coverage < 0.15 AND person_present==false (uncertain detection).
- ACCEPT otherwise (food is clearly present).

Return JSON only (no prose):
{
  "person_present": boolean,
  "objects": [
    {"label": "tomato", "is_food": true, "box": {"x":0.12,"y":0.34,"w":0.18,"h":0.22}},
    ...
  ],
  "food_coverage": 0.42,
  "decision": "ACCEPT" | "BORDERLINE" | "REJECT",
  "reason": "Brief explanation in plain English"
}`;

interface AnalysisResult {
  person_present: boolean;
  objects: Array<{
    label: string;
    is_food: boolean;
    box: { x: number; y: number; w: number; h: number };
  }>;
  food_coverage: number;
  decision: 'ACCEPT' | 'BORDERLINE' | 'REJECT';
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${images.length} images with OpenAI Vision`);
    
    const results: AnalysisResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      
      // Ensure proper data URL format
      const imageUrl = imageData.startsWith('data:') 
        ? imageData 
        : `data:image/jpeg;base64,${imageData}`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: SYSTEM_PROMPT
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageUrl,
                      detail: 'high'
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.1
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error for image ${i + 1}:`, response.status, errorText);
          
          if (response.status === 401) {
            return new Response(
              JSON.stringify({ error: 'Invalid OpenAI API key' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          console.error(`No content in response for image ${i + 1}`);
          continue;
        }

        // Parse the JSON response
        let analysis: AnalysisResult;
        try {
          // Remove markdown code blocks if present
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          analysis = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error(`Failed to parse JSON for image ${i + 1}:`, content);
          continue;
        }

        console.log(`Image ${i + 1} analysis:`, {
          decision: analysis.decision,
          person_present: analysis.person_present,
          food_coverage: analysis.food_coverage,
          objects_count: analysis.objects?.length || 0,
          reason: analysis.reason
        });

        results.push(analysis);

        // Handle rejection cases
        if (analysis.decision === 'REJECT') {
          let errorMessage = 'Please upload a photo showing food or ingredients.';
          
          // Contextual error messages
          if (analysis.person_present && analysis.food_coverage < 0.10) {
            errorMessage = `This photo shows a person with minimal food visible (${Math.round(analysis.food_coverage * 100)}%). Please take a closer shot focusing on the ingredients.`;
          } else if (analysis.objects.filter(obj => obj.is_food).length === 0) {
            errorMessage = "We couldn't detect any food in this photo. Please upload images showing ingredients or groceries.";
          }
          
          return new Response(
            JSON.stringify({ 
              error: errorMessage,
              reason: analysis.reason,
              person_present: analysis.person_present,
              food_coverage: analysis.food_coverage,
              decision: 'REJECT'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (imageError) {
        console.error(`Error processing image ${i + 1}:`, imageError);
        continue;
      }
    }

    // All images passed validation
    if (results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to analyze images' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for borderline cases
    const hasBorderline = results.some(r => r.decision === 'BORDERLINE');
    const avgCoverage = results.reduce((sum, r) => sum + r.food_coverage, 0) / results.length;
    
    // Return all food objects with bounding boxes
    const foodObjects = results.flatMap(r => 
      r.objects.filter(obj => obj.is_food)
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        analyzed: results.length,
        foodObjects,
        avgCoverage,
        borderline: hasBorderline,
        coveragePercent: Math.round(avgCoverage * 100)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
