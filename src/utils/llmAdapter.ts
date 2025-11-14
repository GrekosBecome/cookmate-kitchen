import { PantryItem, Preferences, Recipe, ShoppingState } from '@/types';
import { allergenCheck, buildContextMessage, proposeSubstitutions, scaleServings } from './chatTools';
import { supabase } from '@/lib/supabaseClient';

const SYSTEM_PROMPT = `You are "The Chef" — a warm, witty, emotionally intelligent AI cooking companion.
Your mission is to make cooking feel effortless, personal, and uplifting.
You combine culinary knowledge with empathy and light humor.

--- CORE PERSONALITY ---
- Friendly, calm, and positive tone — like a mindful friend who loves food.
- Speak in simple, clear, conversational English (or Greek if user does).
- Use 1 emoji per message maximum, naturally placed at the end or start.
- Always sound human, not robotic.
- Treat every interaction as a small emotional experience.

--- COMMUNICATION STYLE ---
1. Build familiarity from the first message. Use the user's name if known.
2. Adjust tone based on emotion detected:
   - If user sounds tired/sad → be comforting and gentle.
   - If user is excited → be energetic and playful.
   - If user is indecisive → suggest 2–3 simple options.
3. Never give commands — offer suggestions:
   - "Want me to show you something quick?"
   - "How about something cozy and light?"
   - "If you're in the mood, we can try this idea 🍳."
4. Never criticize — respond with encouragement and humor.

--- CONVERSATION LOGIC ---
- When user says "I have nothing in my fridge" → reply calmly:
  "No worries! Even one egg can become something magical 🍳."
- When user says "I don't feel like cooking" →
  "Totally fair. Want a 5-min recipe that asks for zero effort?"
- When user says "I made this today!" →
  "That's awesome! Chef approves with 5 golden stars ⭐️⭐️⭐️⭐️⭐️."

--- EMOTIONAL INTELLIGENCE ---
- If user expresses stress or fatigue, offer light empathy first, then a small solution:
  "Rough day? Let's make something quick and comforting — soup, maybe?"
- Every few messages, add gentle motivation:
  "Cooking isn't about perfection — it's about care 🧡."
- Celebrate small wins: "You cooked today — that's huge!"

--- BEHAVIORAL RULES ---
- Always be polite, caring, and emotionally safe.
- Do not judge eating habits, body, or lifestyle.
- Use humor softly, never sarcastically.
- If user doesn't know what to cook, ask guiding questions instead of listing recipes.
- Keep answers short, easy to scan, and uplifting.
- If you don't know something → say: "Let me think that through... I might surprise you."

--- INTERACTION DESIGN ---
- Simulate a natural conversational flow.
- Use small natural phrases ("hmm", "alright", "let's see") at times.
- End messages with soft emotional touches when appropriate.

--- HARD RULES ---
- Respect diet, allergies, and dislikes at all times. Never propose forbidden items.
- Prefer ≤30-minute recipes; if longer, offer a faster alternative.
- When the user asks for a tweak (scale servings, swap an ingredient, reduce time), show only the delta changes if possible.
- Always include an allergen check line when relevant.

Default output format (adapt based on conversation):
- Title
- Steps (numbered, brief)
- Time (minutes) and approx. kcal per serving
- Substitution (one helpful swap) or Variation
- Allergen check: [summary tailored to user]

If you lack enough pantry context, ask one targeted question with warmth.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMRequest {
  messages: ChatMessage[];
  pantryItems: PantryItem[];
  preferences: Preferences;
  recipe?: Recipe;
  signals?: Array<{ type: string; recipeId: string }>;
  shoppingState?: ShoppingState;
}

export interface LLMResponse {
  content?: string;
  allergenWarning?: string;
}

const detectIntent = (userMessage: string): { type: string; details: any } => {
  const lower = userMessage.toLowerCase();
  
  if (lower.includes('scale') && /\d+/.test(lower)) {
    const match = lower.match(/scale.*?(\d+)/);
    const targetServings = match ? parseInt(match[1]) : 4;
    return { type: 'scale', details: { targetServings } };
  }
  
  if (lower.includes('swap') || lower.includes('substitut') || lower.includes('replace')) {
    return { type: 'substitute', details: {} };
  }
  
  if (lower.includes('shorten') || lower.includes('quicker') || lower.includes('faster')) {
    return { type: 'shorten', details: {} };
  }
  
  if (lower.includes('similar') || lower.includes('alternative')) {
    return { type: 'similar', details: {} };
  }
  
  return { type: 'general', details: {} };
};

const generateMockResponse = (request: LLMRequest): LLMResponse => {
  const { messages, pantryItems, preferences, recipe } = request;
  const lastMessage = messages[messages.length - 1];
  const intent = detectIntent(lastMessage.content);
  
  // Check allergens if recipe exists
  let allergenWarning: string | undefined;
  if (recipe) {
    const check = allergenCheck(recipe.ingredients, preferences);
    if (!check.safe) {
      allergenWarning = check.warning;
    }
  }
  
  let content = '';
  
  switch (intent.type) {
    case 'scale':
      if (!recipe) {
        content = `I need to know which recipe you want to scale! Could you tell me which dish you're working with? 🍳`;
      } else {
        const targetServings = intent.details.targetServings;
        const scaled = scaleServings(recipe.ingredients, preferences.servings, targetServings);
        
        content = `**Scaling ${recipe.title} to ${targetServings} servings**\n\n`;
        content += `Updated ingredients:\n`;
        scaled.forEach(ing => {
          if (ing.scaledQty) {
            content += `- ${ing.name}: ${ing.scaledQty} ${ing.unit || ''}\n`;
          } else {
            content += `- ${ing.name}: adjust to taste\n`;
          }
        });
        content += `\n**Time:** ${recipe.timeMin} min (unchanged)\n`;
        content += `**Calories:** ~${recipe.kcal ? Math.round((recipe.kcal / preferences.servings) * targetServings) : '?'} total\n\n`;
        content += `**Allergen check:** ${allergenWarning ? allergenWarning : 'All good! ✅'}\n\n`;
        content += `Need help with anything else for this recipe? 🤔`;
      }
      break;
      
    case 'substitute':
      if (!recipe) {
        content = `What ingredient do you want to swap? I can suggest alternatives based on your pantry! 🔄`;
      } else {
        const missing = recipe.needs.filter(need => 
          !pantryItems.some(p => p.name.toLowerCase().includes(need.toLowerCase()) && !p.used)
        ).slice(0, 3);
        
        if (missing.length === 0) {
          content = `**Great news!** You have all the main ingredients for ${recipe.title}! 🎉\n\n`;
          content += `If you want to swap something for variety:\n`;
          const subs = proposeSubstitutions([recipe.needs[0]], pantryItems);
          subs[0].alternatives.forEach(alt => {
            content += `- ${alt.name}${alt.inPantry ? ' ✅ (in pantry)' : ''}: ${alt.note}\n`;
          });
        } else {
          content = `**Missing ingredients for ${recipe.title}:**\n\n`;
          const subs = proposeSubstitutions(missing, pantryItems);
          subs.forEach(sub => {
            content += `**${sub.original}** → Swap with:\n`;
            sub.alternatives.forEach(alt => {
              content += `- ${alt.name}${alt.inPantry ? ' ✅ (in pantry)' : ''}: ${alt.note}\n`;
            });
            content += `\n`;
          });
        }
        content += `**Allergen check:** ${allergenWarning ? allergenWarning : 'Safe with these swaps ✅'}\n\n`;
        content += `Want me to scale this recipe or suggest something different? 🍽️`;
      }
      break;
      
    case 'shorten':
      if (!recipe) {
        content = `Which recipe do you want to speed up? Let me know and I'll suggest time-saving tips! ⏱️`;
      } else {
        content = `**Faster version of ${recipe.title}**\n\n`;
        content += `Quick tips:\n`;
        content += `1. Prep ingredients while heating pan (saves 5 min)\n`;
        content += `2. Use higher heat (reduce time by ~${Math.round(recipe.timeMin * 0.2)} min)\n`;
        content += `3. Cut ingredients smaller for faster cooking\n\n`;
        content += `**New time:** ~${Math.round(recipe.timeMin * 0.7)} min\n`;
        content += `**Calories:** ${recipe.kcal || '?'} kcal/serving (unchanged)\n\n`;
        content += `**Allergen check:** ${allergenWarning ? allergenWarning : 'All safe! ✅'}\n\n`;
        content += `Need the full quick recipe steps? 📝`;
      }
      break;
      
    case 'similar':
      content = `**Similar to ${recipe?.title || 'your preferences'}:**\n\n`;
      content += `Based on your pantry, I'd suggest:\n`;
      content += `1. **Quick Veggie Stir-fry** (15 min, ~280 kcal)\n`;
      content += `2. **Simple Pasta Primavera** (20 min, ~320 kcal)\n`;
      content += `3. **Easy Fried Rice** (18 min, ~290 kcal)\n\n`;
      content += `**Time:** All under 25 min\n`;
      content += `**Allergen check:** ${allergenWarning ? allergenWarning : 'Diet-friendly options available ✅'}\n\n`;
      content += `Want me to show ingredients for any of these? 🍜`;
      break;
      
    default:
      content = `I'm here to help with your cooking! I can:\n\n`;
      content += `- Scale recipes to any serving size\n`;
      content += `- Suggest ingredient swaps based on your pantry\n`;
      content += `- Show you faster cooking methods\n`;
      content += `- Find similar recipes you might like\n\n`;
      if (recipe) {
        content += `We're talking about **${recipe.title}** (${recipe.timeMin} min, ${recipe.kcal || '?'} kcal/serving).\n\n`;
        content += `**Allergen check:** ${allergenWarning ? allergenWarning : 'This recipe looks safe for you! ✅'}\n\n`;
      }
      content += `What would you like to know? 👨‍🍳`;
  }
  
  return {
    content,
    allergenWarning,
  };
};

const callEdgeFunction = async (request: LLMRequest): Promise<LLMResponse> => {
  try {
    const context = buildContextMessage(
      request.pantryItems,
      request.preferences,
      request.recipe,
      request.signals,
      request.shoppingState
    );
    
    const messages = request.messages.filter(m => m.role !== 'system');
    
    // Get current session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.error('No active session');
      return generateMockResponse(request);
    }
    
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chef-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        messages,
        context,
        pantry: request.pantryItems,
        cart: request.shoppingState?.queue || [],
      }),
    });
    
    if (!response.ok) {
      console.error('Edge function error:', response.status);
      
      // Handle limit reached (403)
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Usage limit reached');
      }
      
      return generateMockResponse(request);
    }
    
    const data = await response.json();
    
    // If the response indicates it's a mock or fallback, use local mock
    if (data.isMock) {
      console.log('Edge function returned mock response');
      return generateMockResponse(request);
    }
    
    const content = data.content || 'Sorry, I had trouble generating a response.';
    
    // Check allergens
    let allergenWarning: string | undefined;
    if (request.recipe) {
      const check = allergenCheck(request.recipe.ingredients, request.preferences);
      if (!check.safe) {
        allergenWarning = check.warning;
      }
    }
    
    return { content, allergenWarning };
  } catch (error) {
    console.error('Error calling edge function:', error);
    return generateMockResponse(request);
  }
};

export const getLLMResponse = async (request: LLMRequest): Promise<LLMResponse> => {
  // Try edge function first, fall back to mock if unavailable
  return callEdgeFunction(request);
};
