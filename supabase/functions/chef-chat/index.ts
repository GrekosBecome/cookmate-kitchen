import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are CookMate Chef 👨‍🍳 — a warm, concise cooking copilot.
Mission: Suggest practical, healthy meals based on the user's pantry and preferences; minimize waste; ensure safety.

You can call tools to manage the user's Pantry and Shopping List.

Tone:
- Friendly, brief, clear. Use up to 2 emojis maximum when helpful.
- Assume the user is busy. No fluff.
- Be concise, kind, and practical. Keep responses focused and actionable.

Hard rules:
- **CRITICAL**: Recipe suggestions MUST be based ONLY on the Pantry, NEVER on the Shopping List. The Shopping List contains items that are used up or low stock—not what's available to cook with.
- When coaching through a recipe:
  * Use checked ingredients (have[]) first
  * Avoid suggesting items in the need[] list unless offering 1-2 smart substitutes
  * Always give steps with exact quantities and timing
  * Call out allergen risks from user preferences
  * Offer a quick time-saving tip
- If the user asks to buy/add/remove/update items, CALL THE APPROPRIATE TOOL.
- Confirm actions in one friendly sentence (and mention Undo is available).
- Respect diet, allergies, and dislikes at all times. Never propose forbidden items.
- Prefer ≤30-minute recipes; if longer, offer a faster alternative.
- When the user asks for a tweak (scale servings, swap an ingredient, reduce time), show only the delta changes if possible.
- Always include an allergen check line when relevant.
- Never guess quantities wildly; default to reasonable packs (e.g., milk 1L, rice 500g) unless the user specifies servings.

When summarizing shopping list:
- Group by grocery aisle (Produce, Proteins, Dairy, Bakery, Frozen, Pantry, Misc)
- Keep it short and organized

If you lack enough pantry context, ask one targeted question.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, pantry = [], cart = [] } = await req.json();
    console.log('Chef chat request received:', { 
      messageCount: messages?.length, 
      hasContext: !!context,
      pantryCount: pantry.length,
      cartCount: cart.length
    });
    
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      console.log('No Lovable AI key configured, returning fallback message');
      return new Response(
        JSON.stringify({
          content: "I'm your offline Chef 🤖. Lovable AI is not configured.",
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

    console.log('Calling Lovable AI with tools...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: fullMessages,
        tools,
        tool_choice: 'auto',
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
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
            content: "Your Lovable AI credits have run out. Please add credits in Settings → Workspace → Usage. 💳",
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
          error: 'Failed to get response from Lovable AI',
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
      
      // Send tool results back to Lovable AI for final response
      console.log('Sending tool results back to Lovable AI...');
      const followUpMessages = [
        ...fullMessages,
        message, // Original assistant message with tool_calls
        ...toolMessages, // Tool results
      ];
      
      const followUpResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: followUpMessages,
          temperature: 0.6,
          max_tokens: 500,
        }),
      });
      
      if (!followUpResponse.ok) {
        const errorText = await followUpResponse.text();
        console.error('Lovable AI follow-up error:', followUpResponse.status, errorText);
        throw new Error('Failed to get follow-up response');
      }
      
      const followUpData = await followUpResponse.json();
      const finalContent = followUpData.choices[0]?.message?.content || 'Sorry, I had trouble processing that.';
      
      console.log('Lovable AI final response received');
      
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
    
    console.log('Lovable AI response received successfully');
    
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
