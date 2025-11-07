import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { RECIPE_CATALOG } from '@/data/recipes';
import { Recipe } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Clock, Flame, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { FloatingButtons } from '@/components/FloatingButtons';
import { track } from '@/lib/analytics';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    consumePantryForRecipe,
    addSignal,
    recordUsageEvent,
    updatePantryConfidenceAfterRecipe,
    undoLastUsageEvent,
    shoppingState,
    updateMemory,
    addRecentAction,
    aiGeneratedRecipes,
  } = useStore();
  
  const recipe = RECIPE_CATALOG.find(r => r.id === id) || 
                 aiGeneratedRecipes.find((r: Recipe) => r.id === id) as Recipe | undefined;
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [hasMarkedUsed, setHasMarkedUsed] = useState(false);
  
  // Track page view
  useState(() => {
    if (recipe) {
      track('opened_screen', { screen: 'recipe', recipeId: recipe.id });
    }
  });

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Recipe not found</h2>
          <Button onClick={() => navigate('/suggestion')}>
            Back to Suggestions
          </Button>
        </div>
      </div>
    );
  }

  const toggleIngredient = (index: number) => {
    const newSet = new Set(checkedIngredients);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCheckedIngredients(newSet);
  };

  const handleStartCooking = () => {
    track('clicked_cta', { action: 'start_cooking', recipeId: recipe.id });
    addRecentAction('start_cooking', { recipeId: recipe.id });
    
    // Compute have and need arrays based on checked state
    const have = recipe.ingredients
      .filter((ing, idx) => checkedIngredients.has(idx) && !ing.optional)
      .map(ing => ing.name);
    
    const need = recipe.ingredients
      .filter((ing, idx) => !checkedIngredients.has(idx) && !ing.optional)
      .map(ing => ing.name);
    
    // Navigate to chat with recipe context
    const params = new URLSearchParams({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      have: have.join(','),
      need: need.join(','),
      timeMin: recipe.timeMin?.toString() || '',
    });
    
    navigate(`/chat?${params.toString()}`);
  };

  const handleMarkUsed = () => {
    track('recipe_completed', { recipeId: recipe.id });
    addRecentAction('recipe_completed', { recipeId: recipe.id });
    
    const now = new Date().toISOString();

    // Update memory
    updateMemory({
      lastRecipe: recipe.id,
      lastRecipeName: recipe.title,
      lastCookDate: now,
    });

    // Create usage event
    const usageEvent = {
      ts: now,
      recipeId: recipe.id,
      recipeName: recipe.title,
      ingredients: recipe.ingredients
        .filter((ing) => !ing.optional)
        .map((ing) => ({
          name: ing.pantryName || ing.name,
          qty: ing.qty,
          unit: ing.unit,
        })),
    };

    // Record usage and update confidence
    recordUsageEvent(usageEvent);
    updatePantryConfidenceAfterRecipe(recipe.id, recipe.title, recipe.ingredients);

    // Consume pantry items (mark as used)
    const ingredientNames = recipe.ingredients
      .filter((ing) => !ing.optional)
      .map((ing) => ing.pantryName || ing.name);

    consumePantryForRecipe(ingredientNames);

    // Add learning signal
    addSignal({
      ts: now,
      type: 'accepted',
      recipeId: recipe.id,
      tags: recipe.tags,
      needs: recipe.needs,
    });

    setHasMarkedUsed(true);

    // Check if new shopping items were added
    const newLowItems = shoppingState.queue.filter(
      (item) =>
        !item.bought &&
        new Date(item.addedAt).getTime() > Date.now() - 5000
    );

    if (newLowItems.length > 0) {
      toast.success(`Added ${newLowItems.length} item${newLowItems.length > 1 ? 's' : ''} to shopping list 🧺`, {
        action: {
          label: 'View',
          onClick: () => navigate('/pantry?tab=shopping'),
        },
        duration: 10000,
      });
    } else {
      toast.success('Pantry updated! 🎉 — Confidence levels adjusted', {
        action: {
          label: 'Undo',
          onClick: () => {
            undoLastUsageEvent();
            toast.success('Changes undone');
          },
        },
        duration: 10000,
      });
    }

    setTimeout(() => {
      navigate('/suggestion');
    }, 2000);
  };

  return (
    <div 
      className="min-h-screen bg-background pb-28"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 112px)',
      }}
    >
      <div className="container max-w-2xl mx-auto px-4 py-4 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/suggestion')}
          className="gap-2 h-11 min-w-[44px] min-h-[44px]"
          aria-label="Back to suggestions"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Button>

        <header className="space-y-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">{recipe.title}</h1>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {recipe.timeMin}m
            </Badge>
            {recipe.kcal && (
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3" />
                {recipe.kcal} kcal
              </Badge>
            )}
            {recipe.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-3">
                <Checkbox
                  checked={checkedIngredients.has(index)}
                  onCheckedChange={() => toggleIngredient(index)}
                />
                <label className="flex-1 cursor-pointer capitalize">
                  {ingredient.name}
                  {ingredient.qty && ingredient.unit && (
                    <span className="text-muted-foreground ml-2">
                      ({ingredient.qty}{ingredient.unit})
                    </span>
                  )}
                  {ingredient.optional && (
                    <span className="text-muted-foreground italic ml-2">
                      (optional)
                    </span>
                  )}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {recipe.substitutions && Object.keys(recipe.substitutions).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Substitutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(recipe.substitutions).map(([ingredient, substitute]) => (
                <div key={ingredient} className="text-sm">
                  <span className="font-medium capitalize">{ingredient}</span>
                  <span className="text-muted-foreground"> → {substitute}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {recipe.healthNote && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{recipe.healthNote}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky bottom CTA bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-40"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)', // Space for bottom nav
        }}
      >
        <div className="container max-w-2xl mx-auto p-4">
          {!hasMarkedUsed ? (
            <div className="flex gap-3">
              <Button
                onClick={handleStartCooking}
                variant="outline"
                className="flex-1 h-12 sm:h-14 min-h-[44px] text-sm sm:text-base font-semibold"
                aria-label="Start cooking"
              >
                Let's cook
              </Button>
              <Button
                onClick={handleMarkUsed}
                className="flex-1 h-12 sm:h-14 min-h-[44px] text-sm sm:text-base font-semibold"
                aria-label="Mark as used"
              >
                Mark as used
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate('/suggestion')}
              className="w-full h-12 sm:h-14 min-h-[44px] text-sm sm:text-base font-semibold"
              aria-label="What's next"
            >
              What's next?
            </Button>
          )}
        </div>
      </div>

      <FloatingButtons recipeId={recipe.id} />
    </div>
  );
};

export default RecipeDetail;
