import { PantryItem, Preferences, Recipe, Ingredient, ShoppingState } from '@/types';

export interface ScaledIngredient extends Ingredient {
  originalQty?: number;
  scaledQty?: number;
}

export const scaleServings = (
  ingredients: Ingredient[],
  currentServings: number,
  targetServings: number
): ScaledIngredient[] => {
  const ratio = targetServings / currentServings;
  
  return ingredients.map(ing => {
    if (!ing.qty) {
      return {
        ...ing,
        scaledQty: undefined,
      };
    }
    
    return {
      ...ing,
      originalQty: ing.qty,
      scaledQty: Math.round(ing.qty * ratio * 100) / 100,
      qty: Math.round(ing.qty * ratio * 100) / 100,
    };
  });
};

export interface SubstitutionSuggestion {
  original: string;
  alternatives: Array<{
    name: string;
    inPantry: boolean;
    note?: string;
  }>;
}

const SUBSTITUTION_MAP: Record<string, Array<{ name: string; note?: string }>> = {
  'butter': [
    { name: 'olive oil', note: 'Use 3/4 cup oil per 1 cup butter' },
    { name: 'coconut oil', note: 'Equal amounts, adds slight coconut flavor' },
    { name: 'avocado', note: 'Great for baking, equal amounts' },
  ],
  'milk': [
    { name: 'almond milk', note: 'Equal amounts' },
    { name: 'oat milk', note: 'Equal amounts, creamier' },
    { name: 'water + butter', note: '1 cup = 7/8 cup water + 1 tbsp butter' },
  ],
  'eggs': [
    { name: 'flax eggs', note: '1 egg = 1 tbsp flax + 3 tbsp water' },
    { name: 'applesauce', note: '1 egg = 1/4 cup applesauce' },
    { name: 'banana', note: '1 egg = 1/4 cup mashed banana' },
  ],
  'flour': [
    { name: 'almond flour', note: 'Use 1:1, denser texture' },
    { name: 'oat flour', note: 'Use 1:1, slightly sweet' },
    { name: 'coconut flour', note: 'Use 1/4 cup per 1 cup flour + extra liquid' },
  ],
  'sugar': [
    { name: 'honey', note: 'Use 3/4 cup per 1 cup sugar, reduce liquid' },
    { name: 'maple syrup', note: 'Use 3/4 cup per 1 cup sugar, reduce liquid' },
    { name: 'stevia', note: 'Much sweeter, use conversion chart' },
  ],
  'cream': [
    { name: 'coconut cream', note: 'Equal amounts, dairy-free' },
    { name: 'cashew cream', note: 'Blend soaked cashews with water' },
    { name: 'milk + butter', note: '1 cup = 3/4 cup milk + 1/3 cup butter' },
  ],
  'cheese': [
    { name: 'nutritional yeast', note: 'Adds cheesy flavor, not texture' },
    { name: 'cashew cheese', note: 'Blend soaked cashews with lemon' },
    { name: 'tofu', note: 'For texture, less flavor' },
  ],
  'chicken': [
    { name: 'tofu', note: 'Press and marinate well' },
    { name: 'chickpeas', note: 'Roasted for crispy texture' },
    { name: 'mushrooms', note: 'Meaty texture' },
  ],
  'beef': [
    { name: 'lentils', note: 'Great for bolognese' },
    { name: 'mushrooms', note: 'Umami-rich' },
    { name: 'beans', note: 'Black beans for burgers' },
  ],
};

export const proposeSubstitutions = (
  missingIngredients: string[],
  pantryItems: PantryItem[]
): SubstitutionSuggestion[] => {
  const pantryNames = pantryItems.map(p => p.name.toLowerCase());
  
  return missingIngredients.map(missing => {
    const key = Object.keys(SUBSTITUTION_MAP).find(k => 
      missing.toLowerCase().includes(k)
    );
    
    const alternatives = key 
      ? SUBSTITUTION_MAP[key].map(alt => ({
          ...alt,
          inPantry: pantryNames.includes(alt.name.toLowerCase()),
        }))
      : [
          { name: 'similar ingredient', inPantry: false, note: 'Use what you have on hand' },
        ];
    
    return {
      original: missing,
      alternatives: alternatives.slice(0, 3),
    };
  });
};

export interface AllergenCheckResult {
  safe: boolean;
  conflicts: string[];
  warning?: string;
}

export const allergenCheck = (
  ingredients: Ingredient[],
  preferences: Preferences
): AllergenCheckResult => {
  const allergies = preferences.allergies.map(a => a.toLowerCase());
  const dislikes = preferences.dislikes.map(d => d.toLowerCase());
  
  const conflicts: string[] = [];
  
  ingredients.forEach(ing => {
    const ingName = ing.name.toLowerCase();
    
    allergies.forEach(allergy => {
      if (ingName.includes(allergy)) {
        conflicts.push(`${ing.name} (allergy: ${allergy})`);
      }
    });
    
    dislikes.forEach(dislike => {
      if (ingName.includes(dislike)) {
        conflicts.push(`${ing.name} (dislike: ${dislike})`);
      }
    });
  });
  
  // Diet checks
  if (preferences.diet === 'Vegan') {
    const nonVegan = ['egg', 'milk', 'butter', 'cheese', 'cream', 'honey', 'chicken', 'beef', 'fish', 'meat'];
    ingredients.forEach(ing => {
      const ingName = ing.name.toLowerCase();
      if (nonVegan.some(nv => ingName.includes(nv))) {
        if (!conflicts.some(c => c.startsWith(ing.name))) {
          conflicts.push(`${ing.name} (not vegan)`);
        }
      }
    });
  } else if (preferences.diet === 'Vegetarian') {
    const nonVeg = ['chicken', 'beef', 'fish', 'meat', 'pork'];
    ingredients.forEach(ing => {
      const ingName = ing.name.toLowerCase();
      if (nonVeg.some(nv => ingName.includes(nv))) {
        if (!conflicts.some(c => c.startsWith(ing.name))) {
          conflicts.push(`${ing.name} (not vegetarian)`);
        }
      }
    });
  }
  
  const safe = conflicts.length === 0;
  const warning = !safe 
    ? `⚠️ Warning: This recipe contains ${conflicts.length} item(s) that conflict with your preferences.`
    : undefined;
  
  return { safe, conflicts, warning };
};

export const getShoppingContext = (shoppingState: ShoppingState): string => {
  const pending = shoppingState.queue.filter(i => !i.bought);
  if (pending.length === 0) return '';
  
  const items = pending.map(i => `${i.name} (${i.reason === 'used_up' ? 'used up' : 'running low'})`).join(', ');
  return `Shopping list: ${items}`;
};

export const buildContextMessage = (
  pantryItems: PantryItem[],
  preferences: Preferences,
  recipe?: Recipe,
  signals?: Array<{ type: string; recipeId: string }>,
  shoppingState?: ShoppingState
): string => {
  const activePantry = pantryItems.filter(p => !p.used).slice(0, 40);
  
  const pantryList = activePantry.map(p => 
    p.qty && p.unit ? `${p.name} (${p.qty} ${p.unit})` : p.name
  ).join(', ');
  
  let context = `Pantry: ${pantryList || 'Empty'}\n`;
  context += `Preferences: { diet: "${preferences.diet}", allergies: [${preferences.allergies.join(', ')}], dislikes: [${preferences.dislikes.join(', ')}], servingsDefault: ${preferences.servings} }\n`;
  
  if (recipe) {
    const keyIngredients = recipe.needs.slice(0, 5).join(', ');
    context += `Today's suggestion: { recipeId: "${recipe.id}", title: "${recipe.title}", keyIngredients: [${keyIngredients}], timeMin: ${recipe.timeMin}, kcal: ${recipe.kcal || 'unknown'}, tags: [${recipe.tags.join(', ')}] }\n`;
    context += `Recipe ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}\n`;
  }
  
  if (signals && signals.length > 0) {
    const liked = signals.filter(s => s.type === 'accepted').map(s => s.recipeId);
    const skipped = signals.filter(s => s.type === 'skip').map(s => s.recipeId);
    context += `Signals summary: { liked: ${liked.length} recipes, skipped: ${skipped.length} recipes }\n`;
  }
  
  if (shoppingState) {
    const shoppingContext = getShoppingContext(shoppingState);
    if (shoppingContext) {
      context += `${shoppingContext}\n`;
    }
  }
  
  context += `User locale: en\n`;
  
  return context;
};
