import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkAndIncrementUsage } from "../_shared/usageTracking.ts";

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

Use the analyze_food_image tool to return your analysis.`;

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
    // Check usage limits
    const authHeader = req.headers.get('authorization');
    const usageCheck = await checkAndIncrementUsage(authHeader, 'image');
    
    if (!usageCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: usageCheck.error,
          limitReached: true,
          remaining: usageCheck.remaining,
          limit: usageCheck.limit
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { images } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${images.length} images with Gemini Vision`);
    
    const results: AnalysisResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      
      // Ensure proper data URL format
      const imageUrl = imageData.startsWith('data:') 
        ? imageData 
        : `data:image/jpeg;base64,${imageData}`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
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
                      url: imageUrl
                    }
                  }
                ]
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "analyze_food_image",
                  description: "Analyze an image to detect food content and determine if it should be accepted.",
                  parameters: {
                    type: "object",
                    properties: {
                      person_present: {
                        type: "boolean",
                        description: "Whether a person or face is prominent in the image"
                      },
                      objects: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            label: { type: "string", description: "Name of the detected object" },
                            is_food: { type: "boolean", description: "Whether this object is food" },
                            box: {
                              type: "object",
                              properties: {
                                x: { type: "number", minimum: 0, maximum: 1 },
                                y: { type: "number", minimum: 0, maximum: 1 },
                                w: { type: "number", minimum: 0, maximum: 1 },
                                h: { type: "number", minimum: 0, maximum: 1 }
                              },
                              required: ["x", "y", "w", "h"]
                            }
                          },
                          required: ["label", "is_food", "box"]
                        }
                      },
                      food_coverage: {
                        type: "number",
                        minimum: 0,
                        maximum: 1,
                        description: "Total area covered by food (sum of food boxes)"
                      },
                      decision: {
                        type: "string",
                        enum: ["ACCEPT", "BORDERLINE", "REJECT"],
                        description: "Decision on whether to accept the image"
                      },
                      reason: {
                        type: "string",
                        description: "Brief explanation for the decision"
                      }
                    },
                    required: ["person_present", "objects", "food_coverage", "decision", "reason"],
                    additionalProperties: false
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "analyze_food_image" } },
            max_tokens: 1000,
            temperature: 0.1
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Lovable AI error for image ${i + 1}:`, response.status, errorText);
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (response.status === 401) {
            return new Response(
              JSON.stringify({ error: 'Invalid API key' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          continue;
        }

        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall || toolCall.function?.name !== 'analyze_food_image') {
          console.error(`No valid tool call in response for image ${i + 1}`);
          continue;
        }

        // Parse the tool call arguments
        let analysis: AnalysisResult;
        try {
          analysis = JSON.parse(toolCall.function.arguments);
        } catch (parseError) {
          console.error(`Failed to parse tool call arguments for image ${i + 1}:`, toolCall.function.arguments);
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
