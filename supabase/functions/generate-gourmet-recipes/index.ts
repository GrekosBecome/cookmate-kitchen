import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOURMET_SYSTEM_PROMPT = `You are a Michelin-level chef specializing in gourmet yet practical recipes.

Your role:
- Create sophisticated restaurant-quality recipes using provided ingredients
- Recipes must be creative, flavorful, and visually stunning
- Balance gourmet techniques with home kitchen practicality
- Respect all dietary restrictions and allergies
- Include plating presentation tips

Guidelines:
- Use primarily ingredients from the shopping list (80%+)
- Suggest minimal additional staples (salt, pepper, oil, butter)
- Each recipe should take 20-45 minutes
- Include precise measurements and timing
- Add wine/beverage pairing suggestions when appropriate`;

const EVERYDAY_SYSTEM_PROMPT = `You are a practical home chef creating simple, delicious everyday recipes.

Your role:
- Create approachable recipes using available pantry ingredients
- Focus on quick, family-friendly meals
- Recipes should be forgiving and adaptable
- Respect all dietary restrictions and allergies
- Keep techniques simple and accessible

Guidelines:
- Use ingredients from the pantry list as much as possible
- Suggest common household staples (salt, pepper, oil, butter, eggs)
- Each recipe should take 15-30 minutes
- Include simple step-by-step instructions
- Focus on flavor and practicality over presentation`;

const IMPROVISE_SYSTEM_PROMPT = `You are a creative chef who loves to improvise! 

When given "star ingredients", create ONE unique recipe that:
- Features the star ingredients prominently (they should be the main flavors)
- Uses additional pantry items as supporting ingredients (50%+ match)
- Is practical and achievable at home (15-35 minutes)
- Respects dietary restrictions and allergies
- Is creative but not overly complex (everyday difficulty)
- Has clear, step-by-step instructions

Think of it like a cooking show challenge: "Today's star ingredients are X and Y - let's make something amazing!"

Return the recipe using the generate_gourmet_recipes tool with:
- Creative, appetizing title that mentions the star ingredients
- Detailed description that sells the dish
- Practical cooking time and difficulty
- Complete ingredient list with quantities
- Clear step-by-step instructions with timing`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shoppingItems, pantryItems, starIngredients, preferences, mode = 'gourmet' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build ingredients context
    const shoppingList = shoppingItems?.map((i: any) => i.name).join(', ') || '';
    const pantryList = pantryItems?.slice(0, 10).map((i: any) => i.name).join(', ') || 'none';
    
    const dietInfo = preferences?.diet || 'Regular';
    const allergies = preferences?.allergies?.join(', ') || 'none';
    const dislikes = preferences?.dislikes?.join(', ') || 'none';

    let systemPrompt = '';
    let userPrompt = '';
    let minItems = 2;
    let maxItems = 3;

    if (mode === 'improvise') {
      // Chef improvisation mode - ONE unique recipe featuring star ingredients
      systemPrompt = IMPROVISE_SYSTEM_PROMPT;
      minItems = 1;
      maxItems = 1;
      
      const starList = starIngredients?.join(', ') || '';
      
      userPrompt = `STAR INGREDIENTS (feature these prominently):
${starIngredients?.map((item: string) => `- ${item}`).join('\n') || ''}

AVAILABLE SUPPORTING INGREDIENTS (pantry):
${pantryItems?.slice(0, 10).map((item: any) => `- ${item.name} (${item.qty} ${item.unit})`).join('\n') || ''}

USER PREFERENCES:
- Diet: ${dietInfo}
- Allergies: ${allergies}
- Dislikes: ${dislikes}
- Servings: ${preferences?.servings || 2}

Create ONE creative recipe that highlights the star ingredients!`;

      console.log('Chef is improvising with star ingredients:', starList);
    } else {
      // Gourmet or everyday mode - 2-3 recipes
      const isGourmet = mode === 'gourmet';
      systemPrompt = isGourmet ? GOURMET_SYSTEM_PROMPT : EVERYDAY_SYSTEM_PROMPT;
      
      userPrompt = isGourmet 
        ? `Create 2-3 gourmet recipes using these ingredients:

Shopping List (primary ingredients): ${shoppingList}
Available in Pantry: ${pantryList}

Dietary Preference: ${dietInfo}
Allergies to avoid: ${allergies}
Dislikes to avoid: ${dislikes}

Generate creative, restaurant-quality recipes that showcase these ingredients.`
        : `Create 2-3 simple everyday recipes using these pantry ingredients:

Available Ingredients: ${pantryList}
Additional items available: ${shoppingList}

Dietary Preference: ${dietInfo}
Allergies to avoid: ${allergies}
Dislikes to avoid: ${dislikes}

Generate practical, quick recipes that work with what's available.`;
    }

    console.log(`Calling Lovable AI for ${mode} recipes...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_gourmet_recipes',
              description: 'Generate 2-3 gourmet recipes based on shopping list ingredients',
              parameters: {
                type: 'object',
                properties: {
                   recipes: {
                    type: 'array',
                    minItems: minItems,
                    maxItems: maxItems,
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: 'Creative recipe name' },
                        description: { type: 'string', description: 'Brief appetizing description' },
                        timeMin: { type: 'number', description: 'Total time in minutes (20-45)' },
                        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                        kcal: { type: 'number', description: 'Estimated calories per serving' },
                        cuisine: { type: 'string', description: 'Cuisine type (French, Italian, etc.)' },
                        ingredients: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              qty: { type: 'number' },
                              unit: { type: 'string' }
                            },
                            required: ['name']
                          }
                        },
                        steps: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              order: { type: 'number' },
                              text: { type: 'string' },
                              minutes: { type: 'number' }
                            },
                            required: ['order', 'text']
                          }
                        },
                        platingTips: { type: 'string', description: 'Presentation guidance' },
                        winePairing: { type: 'string', description: 'Optional wine/beverage suggestion' }
                      },
                      required: ['title', 'description', 'timeMin', 'difficulty', 'cuisine', 'ingredients', 'steps', 'platingTips']
                    }
                  }
                },
                required: ['recipes']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_gourmet_recipes' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'rate_limit', message: 'Too many requests. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'payment_required', message: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const recipesData = JSON.parse(toolCall.function.arguments);
    
    // Transform to app Recipe format
    const recipes = recipesData.recipes.map((r: any, idx: number) => ({
      id: `ai-${mode}-${Date.now()}-${idx}`,
      title: r.title,
      description: r.description,
      timeMin: r.timeMin,
      kcal: r.kcal,
      difficulty: r.difficulty,
      cuisine: r.cuisine,
      tags: ['ai-generated', mode === 'gourmet' ? 'gourmet' : 'everyday', r.cuisine.toLowerCase()],
      needs: r.ingredients.slice(0, 5).map((i: any) => i.name.toLowerCase()),
      ingredients: r.ingredients.map((i: any) => ({
        name: i.name,
        qty: i.qty,
        unit: i.unit,
        optional: false
      })),
      steps: r.steps,
      platingTips: r.platingTips,
      winePairing: r.winePairing,
      aiGenerated: true
    }));

    console.log(`Generated ${recipes.length} ${mode} recipes`);

    return new Response(
      JSON.stringify({ recipes }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-gourmet-recipes:', error);
    return new Response(
      JSON.stringify({ 
        error: 'generation_failed', 
        message: error instanceof Error ? error.message : 'Failed to generate recipes' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
