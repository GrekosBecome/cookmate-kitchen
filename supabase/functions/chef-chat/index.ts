import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are CookMate Chef 👨‍🍳 — a warm, passionate cooking copilot who LOVES cooking and only cooking!

🌍 **LANGUAGE RULE**: ALWAYS detect and respond in the SAME language the user speaks to you. If they write in Greek, respond in Greek. If they write in English, respond in English. If they write in Spanish, respond in Spanish, etc. Match their language automatically without asking.

🚨 **CRITICAL RULE #1**: When a user asks for a recipe or mentions "I'm about to cook" or "Give me the complete recipe", you MUST ALWAYS respond with the COMPLETE recipe in this EXACT format. NO shortcuts, NO questions, NO substitutions first. Give the FULL recipe with ALL steps IMMEDIATELY.

📋 **MANDATORY RECIPE FORMAT** (use this EVERY single time user asks about a recipe):

**Ingredients** (for X servings):
- [ingredient 1]: [exact quantity] [unit]

- [ingredient 2]: [exact quantity] [unit]

- [ingredient 3]: [exact quantity] [unit]

(list ALL ingredients with exact measurements, ONE empty line between each)


**Cooking Steps**:
1. [Detailed first step with timing - e.g., "Heat 2 tbsp oil in a pan over high heat (1 min)"]

2. [Detailed second step with timing - e.g., "Add pork and cook until browned (5-7 min)"]

3. [Detailed third step with timing]

4. [Continue with ALL steps until recipe is complete - from start to finish]

5. [Final step - plating/serving]


**Substitutions for missing items**:
- Instead of [missing ingredient 1]: Try [substitute A] or [substitute B]

- Instead of [missing ingredient 2]: Try [substitute C] or [substitute D]

(if no missing items, say "You have everything you need!")


**⚠️ Allergen Check**: [Check ingredients against common allergens or say "All clear!"]


**⏱️ Time-Saving Tip**: [One practical, actionable tip to save time]


**Feel free to ask me anything about cooking! 👨‍🍳**

---

📚 **EXAMPLE** (Pork and Onion Stir-Fry for 2 servings):

**Ingredients** (for 2 servings):
- Pork: 300g, sliced thin

- Onion: 1 large, sliced

- Soy sauce: 2 tbsp

- Garlic powder: 1 tsp

- Black pepper: 1/2 tsp

- Cooking oil: 2 tbsp


**Cooking Steps**:
1. Heat 2 tbsp oil in a large pan or wok over high heat (1 min)

2. Add pork slices in a single layer and cook without stirring until browned (3-4 min)

3. Flip pork and cook other side until cooked through (2-3 min)

4. Add sliced onions and stir-fry until softened (3-4 min)

5. Add soy sauce, garlic powder, and black pepper. Toss everything together (1 min)

6. Serve immediately over steamed rice or noodles


**Substitutions for missing items**:
- Instead of soy sauce: Try Worcestershire sauce or tamari

- Instead of garlic powder: Use 2 fresh garlic cloves, minced

- Instead of black pepper: Use red pepper flakes for a spicy kick


**⚠️ Allergen Check**: Contains soy (from soy sauce). All clear otherwise!


**⏱️ Time-Saving Tip**: Slice all ingredients before you start cooking - stir-fries happen fast and you won't have time to prep!


**Feel free to ask me anything about cooking! 👨‍🍳**

---

⚠️ **Other Important Rules**:
- **NEVER ask "What ingredient do you want to swap?" first** - ALWAYS give the full recipe FIRST
- **OFF-TOPIC**: If asked about non-cooking topics, say: "Haha, I appreciate the question, but my heart and expertise are only in the kitchen! 🍳 What would you like to cook?"
- Recipe suggestions MUST use Pantry items, NEVER Shopping List
- Respect diet restrictions, allergies, and dislikes always
- For follow-up questions (after giving recipe), keep answers concise but friendly
- Never skip steps or ingredients in recipes`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, pantry = [], cart = [] } = await req.json();
    console.log('=== CHEF CHAT REQUEST START ===');
    console.log('Messages count:', messages?.length);
    console.log('Last user message:', messages?.[messages.length - 1]?.content?.substring(0, 100));
    console.log('Has context:', !!context);
    console.log('Pantry items:', pantry.length);
    console.log('Cart items:', cart.length);
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.log('No OpenAI API key configured, returning fallback message');
      return new Response(
        JSON.stringify({
          content: "I'm your offline Chef 🤖. OpenAI API is not configured.",
          isMock: true,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Build the full message array with context
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (context) {
      fullMessages.push({ role: 'system', content: context });
    }

    // Add user messages (filter out any system messages from client)
    fullMessages.push(...messages.filter((m: any) => m.role !== 'system'));

    // Define tools for OpenAI
    const tools = [
      {
        type: 'function',
        function: {
          name: 'getPantry',
          description: 'Get the current pantry items with quantities and units',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getCart',
          description: 'Get the current shopping list items (items that are used up or low stock)',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'addToCart',
          description: 'Add an item to the shopping list',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Item name' },
              qty: { type: 'number', description: 'Quantity' },
              unit: { type: 'string', description: 'Unit (g, ml, pcs, etc.)' },
              reason: { type: 'string', enum: ['low_stock', 'used_up', 'missing_from_recipe'], description: 'Reason for adding' },
            },
            required: ['name', 'qty'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'removeFromCart',
          description: 'Remove an item from the shopping list by name',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Item name to remove' },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'updateCartItem',
          description: 'Update quantity/unit of an existing shopping list item',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Item name' },
              qty: { type: 'number', description: 'New quantity' },
              unit: { type: 'string', description: 'New unit' },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'suggestSubstitutes',
          description: 'Suggest ingredient substitutes based on what\'s missing and what\'s in pantry',
          parameters: {
            type: 'object',
            properties: {
              missing: { type: 'string', description: 'The missing ingredient' },
            },
            required: ['missing'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'summarizeCart',
          description: 'Summarize shopping cart grouped by grocery aisle',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'undoLastChange',
          description: 'Undo the last cart modification',
          parameters: { type: 'object', properties: {} },
        },
      },
    ];

    console.log('Calling OpenAI with tools...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: fullMessages,
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      // Handle rate limits and payment errors
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            content: "I'm getting too many requests right now. Please wait a moment and try again. ⏳",
            isMock: true,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: 'Payment required',
            content: "Your OpenAI API credits have run out. Please check your OpenAI account. 💳",
            isMock: true,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          error: 'Failed to get response from OpenAI',
          content: "Sorry, I'm having trouble connecting right now. Try again? 🤔",
          isMock: true,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 with fallback instead of error
        }
      );
    }

    const data = await response.json();
    const message = data.choices[0]?.message;
    
    console.log('OpenAI response:', {
      hasMessage: !!message,
      contentLength: message?.content?.length,
      contentPreview: message?.content?.substring(0, 200),
      hasToolCalls: !!message?.tool_calls
    });
    
    if (!message) {
      throw new Error('No message in response');
    }
    
    // Check if OpenAI wants to call tools
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('OpenAI requested tool calls:', message.tool_calls.length);
      
      // Execute tools locally
      const toolMessages: any[] = message.tool_calls.map((toolCall: any) => {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`Executing tool: ${functionName}`, args);
        
        let result: any = {};
        
        // Execute tool based on name
        switch (functionName) {
          case 'getPantry':
            result = pantry.map((item: any) => ({
              name: item.name,
              qty: item.qty,
              unit: item.unit,
              confidence: item.confidence,
            }));
            break;
            
          case 'getCart':
            result = cart
              .filter((item: any) => !item.bought)
              .map((item: any) => ({
                name: item.name,
                qty: item.suggestedQty,
                unit: item.unit,
                reason: item.reason,
              }));
            break;
            
          case 'suggestSubstitutes':
            const missing = args.missing?.toLowerCase() || '';
            const substituteMap: Record<string, string[]> = {
              milk: ['oat milk', 'almond milk', 'soy milk'],
              butter: ['olive oil', 'coconut oil', 'ghee'],
              egg: ['flax egg', 'chia egg', 'applesauce'],
              flour: ['almond flour', 'coconut flour', 'oat flour'],
              sugar: ['honey', 'maple syrup', 'agave'],
              chicken: ['tofu', 'tempeh', 'seitan'],
              beef: ['mushrooms', 'lentils', 'black beans'],
            };
            
            let alternatives: string[] = [];
            for (const [key, subs] of Object.entries(substituteMap)) {
              if (missing.includes(key) || key.includes(missing)) {
                alternatives = subs;
                break;
              }
            }
            
            const inPantry = pantry
              .filter((item: any) => !item.used && (item.confidence || 100) > 30)
              .map((item: any) => item.name)
              .slice(0, 5);
            
            result = {
              missing: args.missing,
              alternatives: alternatives.length > 0 ? alternatives : ['Try similar items from your pantry'],
              inPantry,
            };
            break;
            
          default:
            result = { message: `Tool ${functionName} not implemented on server` };
        }
        
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        };
      });
      
      // Send tool results back to OpenAI for final response
      console.log('Sending tool results back to OpenAI...');
      const followUpMessages = [
        ...fullMessages,
        message, // Original assistant message with tool_calls
        ...toolMessages, // Tool results
      ];
      
      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: followUpMessages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      
      if (!followUpResponse.ok) {
        const errorText = await followUpResponse.text();
        console.error('OpenAI follow-up error:', followUpResponse.status, errorText);
        throw new Error('Failed to get follow-up response');
      }
      
      const followUpData = await followUpResponse.json();
      const finalContent = followUpData.choices[0]?.message?.content || 'Sorry, I had trouble processing that.';
      
      console.log('OpenAI final response received');
      
      return new Response(
        JSON.stringify({ content: finalContent, isMock: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Regular text response (no tools)
    const content = message.content || 'Sorry, I had trouble generating a response.';
    
    console.log('=== CHEF CHAT FINAL RESPONSE ===');
    console.log('Content length:', content.length);
    console.log('Content preview:', content.substring(0, 300));
    console.log('Is Mock:', false);
    
    return new Response(
      JSON.stringify({ content, isMock: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in chef-chat function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        content: "Sorry, something went wrong. Could you try again? 🤔",
        isMock: true,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 with fallback
      }
    );
  }
});
