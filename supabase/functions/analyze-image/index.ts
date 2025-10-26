import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a vision gatekeeper for a cooking app. Analyze each image and return a strict JSON report.
Rules:
- Detect persons/faces. If any present, set person_present=true.
- Detect objects and label whether each is FOOD (true/false).
- Provide bounding boxes normalized to image width/height: {x, y, w, h} in [0..1].
- Compute food_coverage = sum of FOOD boxes area.
- Decision:
  - REJECT if person_present==true OR food_coverage < 0.20 OR no FOOD objects.
  - ACCEPT otherwise.
- No prose. Return JSON only.
Schema:
{
  "person_present": boolean,
  "objects": [
    {"label": "tomato", "is_food": true, "box": {"x":0.12,"y":0.34,"w":0.18,"h":0.22}},
    ...
  ],
  "food_coverage": 0.42,
  "decision": "ACCEPT" | "REJECT",
  "reason": "string"
}`;

interface AnalysisResult {
  person_present: boolean;
  objects: Array<{
    label: string;
    is_food: boolean;
    box: { x: number; y: number; w: number; h: number };
  }>;
  food_coverage: number;
  decision: 'ACCEPT' | 'REJECT';
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
          objects_count: analysis.objects?.length || 0
        });

        results.push(analysis);

        // If any image is rejected, return immediately
        if (analysis.decision === 'REJECT') {
          return new Response(
            JSON.stringify({ 
              error: 'We only accept clear food photos without people. Please retake a close shot of the ingredients.',
              reason: analysis.reason,
              person_present: analysis.person_present,
              food_coverage: analysis.food_coverage
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

    // Return all food objects with bounding boxes
    const foodObjects = results.flatMap(r => 
      r.objects.filter(obj => obj.is_food)
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        analyzed: results.length,
        foodObjects,
        avgCoverage: results.reduce((sum, r) => sum + r.food_coverage, 0) / results.length
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
