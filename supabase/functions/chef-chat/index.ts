import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are CookMate Chef 👨‍🍳 — a warm, concise cooking copilot.
Mission: Suggest practical, healthy meals based on the user's pantry and preferences; minimize waste; ensure safety.

You can call tools to manage the user's Pantry and Shopping Cart.

Tone:
- Friendly, brief, clear. Use up to 2 emojis maximum when helpful.
- Assume the user is busy. No fluff.

Hard rules:
- If the user asks to buy/add/remove/update items, CALL THE APPROPRIATE TOOL.
- Confirm actions in one friendly sentence (and mention Undo is available).
- Respect diet, allergies, and dislikes at all times. Never propose forbidden items.
- Prefer ≤30-minute recipes; if longer, offer a faster alternative.
- When the user asks for a tweak (scale servings, swap an ingredient, reduce time), show only the delta changes if possible.
- Always include an allergen check line when relevant.
- Never guess quantities wildly; default to reasonable packs (e.g., milk 1L, rice 500g) unless the user specifies servings.

When summarizing cart:
- Group by grocery aisle (Produce, Proteins, Dairy, Bakery, Frozen, Pantry, Misc)
- Keep it short and organized

If you lack enough pantry context, ask one targeted question.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, pantry, cart } = await req.json();
    console.log('Chef chat request received:', { 
      messageCount: messages?.length, 
      hasContext: !!context,
      pantryCount: pantry?.length || 0,
      cartCount: cart?.length || 0
    });
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.log('No OpenAI API key configured, returning fallback message');
      return new Response(
        JSON.stringify({
          content: "I'm your offline Chef 🤖. Add your OpenAI key to unlock real suggestions.",
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
          description: 'Get the current shopping cart items',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'addToCart',
          description: 'Add an item to the shopping cart',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Item name' },
              qty: { type: 'number', description: 'Quantity' },
              unit: { type: 'string', description: 'Unit (g, ml, pcs, etc.)' },
              reason: { type: 'string', enum: ['low_stock', 'used_up', 'user_request'], description: 'Reason for adding' },
            },
            required: ['name', 'qty'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'removeFromCart',
          description: 'Remove an item from the shopping cart by name',
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
          description: 'Update quantity/unit of an existing cart item',
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

    console.log('Calling OpenAI API with tools...');
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
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
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
    
    if (!message) {
      throw new Error('No message in response');
    }
    
    // Check if OpenAI wants to call tools
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('OpenAI requested tool calls:', message.tool_calls.length);
      
      // Execute tool calls and return results
      const toolResults = message.tool_calls.map((toolCall: any) => {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`Executing tool: ${functionName}`, args);
        
        // Return tool call info for client to execute
        return {
          id: toolCall.id,
          name: functionName,
          arguments: args,
        };
      });
      
      return new Response(
        JSON.stringify({ 
          toolCalls: toolResults,
          isMock: false 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Regular text response
    const content = message.content || 'Sorry, I had trouble generating a response.';
    
    console.log('OpenAI response received successfully');
    
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
