import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FOOD_KEYWORDS = [
  'food', 'ingredient', 'vegetable', 'fruit', 'meat', 'dairy', 
  'grain', 'spice', 'beverage', 'drink', 'produce', 'cheese',
  'milk', 'bread', 'pasta', 'rice', 'cereal', 'sauce', 'oil',
  'butter', 'egg', 'fish', 'chicken', 'beef', 'pork', 'seafood',
  'snack', 'dessert', 'sweet', 'condiment', 'herb', 'seasoning',
  'yogurt', 'juice', 'water', 'soda', 'coffee', 'tea'
];

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

    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');
    
    if (!apiKey) {
      console.error('GOOGLE_CLOUD_VISION_API_KEY not found, using mock detection');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          useMock: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${images.length} images for ingredient detection`);
    
    const allDetectedItems = new Map<string, DetectedItem>();
    
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      
      // Strip data URL prefix if present
      const base64Image = imageData.includes('base64,') 
        ? imageData.split('base64,')[1] 
        : imageData;

      try {
        const visionResponse = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { content: base64Image },
                features: [{ type: 'LABEL_DETECTION', maxResults: 20 }]
              }]
            })
          }
        );

        if (!visionResponse.ok) {
          const errorText = await visionResponse.text();
          console.error(`Vision API error for image ${i + 1}:`, errorText);
          continue;
        }

        const visionData = await visionResponse.json();
        const labels = visionData.responses?.[0]?.labelAnnotations || [];
        
        console.log(`Image ${i + 1}: Found ${labels.length} labels`);

        // Filter for food-related labels
        for (const label of labels) {
          const description = label.description.toLowerCase();
          const score = label.score;

          // Only include labels with good confidence
          if (score < 0.6) continue;

          // Check if label is food-related
          const isFoodRelated = FOOD_KEYWORDS.some(keyword => 
            description.includes(keyword) || keyword.includes(description)
          );

          if (isFoodRelated && !allDetectedItems.has(description)) {
            allDetectedItems.set(description, {
              id: `detected-${Date.now()}-${allDetectedItems.size}`,
              name: description,
              confidence: parseFloat(score.toFixed(2))
            });
          }
        }
      } catch (imageError) {
        console.error(`Error processing image ${i + 1}:`, imageError);
        continue;
      }
    }

    const detectedItems = Array.from(allDetectedItems.values());
    
    console.log(`Detection complete: Found ${detectedItems.length} unique ingredients`);

    return new Response(
      JSON.stringify({ detectedItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
