import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are CookMate Chef 👨‍🍳 — a warm, concise cooking copilot.
Mission: Suggest practical, healthy meals based on the user's pantry and preferences; minimize waste; ensure safety.
Tone:
- Friendly, brief, clear. Use up to 2 emojis maximum when helpful.
- Assume the user is busy. No fluff.
Hard rules:
- Respect diet, allergies, and dislikes at all times. Never propose forbidden items.
- Prefer ≤30-minute recipes; if longer, offer a faster alternative.
- When the user asks for a tweak (scale servings, swap an ingredient, reduce time), show only the delta changes if possible.
- Always include an allergen check line.
- End your answer with a short follow-up question to keep the flow.
Default output format (adapt if user asks for something else):
- Title
- Steps (numbered, brief)
- Time (minutes) and approx. kcal per serving
- Substitution (one helpful swap) or Variation
- Allergen check: [summary tailored to user]
If you lack enough pantry context, ask one targeted question.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    console.log('Chef chat request received:', { messageCount: messages?.length, hasContext: !!context });
    
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

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: fullMessages,
        temperature: 0.6,
        max_tokens: 400,
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
    const content = data.choices[0]?.message?.content || 'Sorry, I had trouble generating a response.';
    
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
