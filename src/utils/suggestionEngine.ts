import { Recipe, Preferences, PantryItem, LearningState } from '@/types';
import { RECIPE_CATALOG } from '@/data/recipes';
import { getTagBoost } from '@/lib/learning';

interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  pantryMatchCount: number;
  pantryMatchPercent: number;
}

const DIET_RESTRICTIONS: Record<string, string[]> = {
  'Vegetarian': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'ground beef'],
  'Vegan': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'ground beef', 'eggs', 'milk', 'cheese', 'butter', 'mayo', 'feta', 'parmesan', 'sour cream'],
  'Pescatarian': ['chicken', 'beef', 'pork', 'ground beef'],
  'Keto': ['pasta', 'rice', 'bread', 'taco shells'],
  'Gluten-free': ['pasta', 'bread', 'taco shells'],
};

export function filterRecipesByPreferences(
  recipes: Recipe[],
  preferences: Preferences | null
): Recipe[] {
  if (!preferences) return recipes;

  return recipes.filter((recipe) => {
    // Filter by diet restrictions
    const dietRestrictions = DIET_RESTRICTIONS[preferences.diet] || [];
    const hasRestrictedIngredient = recipe.needs.some(need =>
      dietRestrictions.some(restriction => 
        need.toLowerCase().includes(restriction.toLowerCase())
      )
    );
    if (hasRestrictedIngredient) return false;

    // Filter by allergens
    if (recipe.allergens) {
      const hasAllergen = recipe.allergens.some(allergen =>
        preferences.allergies.some(allergy =>
          allergen.toLowerCase() === allergy.toLowerCase()
        )
      );
      if (hasAllergen) return false;
    }

    // Filter by dislikes
    const hasDislikes = recipe.needs.some(need =>
      preferences.dislikes.some(dislike =>
        need.toLowerCase().includes(dislike.toLowerCase())
      )
    );
    if (hasDislikes) return false;

    return true;
  });
}

export function scoreRecipes(
  recipes: Recipe[],
  pantryItems: PantryItem[]
): ScoredRecipe[] {
  const activePantry = pantryItems.filter(item => !item.used);
  const pantryNames = activePantry.map(item => item.name.toLowerCase());

  return recipes.map(recipe => {
    let score = 0;
    
    // Count pantry matches (non-optional ingredients)
    const requiredNeeds = recipe.needs || [];
    const pantryMatchCount = requiredNeeds.filter(need =>
      pantryNames.some(pantryName => 
        pantryName.includes(need.toLowerCase()) || 
        need.toLowerCase().includes(pantryName)
      )
    ).length;

    const pantryMatchPercent = requiredNeeds.length > 0 
      ? (pantryMatchCount / requiredNeeds.length) * 100 
      : 0;

    // Score: +2 per pantry match
    score += pantryMatchCount * 2;

    // Bonus: +1 if quick (≤25 min)
    if (recipe.timeMin <= 25) {
      score += 1;
    }

    // Only include recipes with ≥50% pantry match
    if (pantryMatchPercent < 50) {
      score = 0;
    }

    return {
      recipe,
      score,
      pantryMatchCount,
      pantryMatchPercent,
    };
  });
}

export function getSuggestions(
  preferences: Preferences | null,
  pantryItems: PantryItem[],
  count: number = 2,
  learning?: LearningState
): Recipe[] {
  // Filter recipes by preferences
  const filtered = filterRecipesByPreferences(RECIPE_CATALOG, preferences);

  // Score recipes
  const scored = scoreRecipes(filtered, pantryItems).map(item => {
    let finalScore = item.score;
    
    // Add learning boost
    if (learning) {
      const learningBoost = item.recipe.tags
        .map(tag => Math.max(0, getTagBoost(tag, learning)))
        .reduce((sum, boost) => sum + boost, 0);
      finalScore += learningBoost;
    }
    
    return { ...item, score: finalScore };
  });

  // Sort by score descending, then by time ascending
  const sorted = scored
    .filter(s => s.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.recipe.timeMin - b.recipe.timeMin;
    });

  // Return top N recipes
  return sorted.slice(0, count).map(s => s.recipe);
}
