import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a food ingredient detection AI. Analyze images of food, groceries, or pantry items and identify all visible food ingredients.

Rules:
- Detect ONLY actual food items, ingredients, or groceries
- Ignore packaging, containers, utensils, or non-food objects
- Be forgiving: accept photos with visible labels, packaging, or background elements
- For each ingredient detected, provide:
  * name: clear, singular ingredient name (e.g., "tomato" not "tomatoes", "milk" not "dairy product")
  * confidence: your confidence level (0.0 to 1.0)
- If you can read labels or text, use that to identify products
- Group similar items (e.g., multiple tomatoes → one "tomato" entry)
- Focus on actual ingredients rather than prepared dishes

Return structured data with ALL detected food ingredients.`;

interface DetectedItem {
  id: string;
  name: string;
  confidence: number;
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

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          useMock: true 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${images.length} images with Lovable AI Vision`);
    
    // Build content array with images
    const content: any[] = [
      {
        type: "text",
        text: "Analyze these images and detect all food ingredients visible. Return structured data with the tool."
      }
    ];

    // Add all images to the content
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      
      // Ensure proper data URL format
      const imageUrl = imageData.startsWith('data:') 
        ? imageData 
        : `data:image/jpeg;base64,${imageData}`;

      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
          detail: "high"
        }
      });
    }

    try {
      // Call Lovable AI with vision + tool calling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: content
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "detect_ingredients",
                description: "Return detected food ingredients with confidence scores",
                parameters: {
                  type: "object",
                  properties: {
                    ingredients: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { 
                            type: "string",
                            description: "Ingredient name in singular form (e.g., 'tomato', 'egg', 'milk')"
                          },
                          confidence: { 
                            type: "number",
                            description: "Confidence score between 0.0 and 1.0"
                          }
                        },
                        required: ["name", "confidence"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["ingredients"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "detect_ingredients" } },
          max_tokens: 1000,
          temperature: 0.3
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Lovable AI error:`, response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ 
              error: 'Rate limit exceeded. Please wait a moment and try again.',
              useMock: true 
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ 
              error: 'AI credits depleted. Please add credits to your workspace.',
              useMock: true 
            }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'AI detection failed',
            useMock: true 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      
      // Extract tool call result
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.error('No tool call in response');
        return new Response(
          JSON.stringify({ 
            error: 'No ingredients detected',
            useMock: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const functionArgs = JSON.parse(toolCall.function.arguments);
      const ingredients = functionArgs.ingredients || [];
      
      console.log(`Detection complete: Found ${ingredients.length} ingredients`);

      // Transform to expected format
      const detectedItems: DetectedItem[] = ingredients.map((item: any, index: number) => ({
        id: `detected-${Date.now()}-${index}`,
        name: item.name.toLowerCase(),
        confidence: parseFloat(item.confidence.toFixed(2))
      }));

      return new Response(
        JSON.stringify({ detectedItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout after 30 seconds');
        return new Response(
          JSON.stringify({ 
            error: 'Detection took too long. Please try with fewer or smaller images.',
            useMock: true 
          }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in detect-ingredients function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        useMock: true 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
