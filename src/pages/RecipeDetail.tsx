import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { RECIPE_CATALOG } from '@/data/recipes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Clock, Flame, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { consumePantryForRecipe, addSignal } = useStore();
  
  const recipe = RECIPE_CATALOG.find(r => r.id === id);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [hasMarkedUsed, setHasMarkedUsed] = useState(false);

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

  const toggleStep = (index: number) => {
    const newSet = new Set(checkedSteps);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCheckedSteps(newSet);
  };

  const handleStartCooking = () => {
    document.getElementById('steps-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMarkUsed = () => {
    const ingredientNames = recipe.ingredients
      .filter(ing => !ing.optional)
      .map(ing => ing.pantryName || ing.name);
    
    const consumedCount = consumePantryForRecipe(ingredientNames);
    
    setHasMarkedUsed(true);
    
    addSignal({
      ts: new Date().toISOString(),
      type: 'accepted',
      recipeId: recipe.id,
      tags: recipe.tags,
      needs: recipe.needs,
    });

    toast({
      title: "Pantry updated! 🎉",
      description: consumedCount > 0 
        ? `${consumedCount} items marked as used.`
        : "Couldn't find matching items — might need a pantry refresh?",
    });

    setTimeout(() => {
      navigate('/suggestion');
    }, 2000);
  };

  const totalTime = recipe.steps.reduce((acc, step) => acc + (step.minutes || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/suggestion')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <header className="space-y-3">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
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

        <Card id="steps-section">
          <CardHeader>
            <CardTitle>Steps</CardTitle>
            <p className="text-sm text-muted-foreground">
              Estimated time: {totalTime} minutes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recipe.steps.map((step, index) => (
              <div key={step.order}>
                <div className="flex gap-3">
                  <Checkbox
                    checked={checkedSteps.has(index)}
                    onCheckedChange={() => toggleStep(index)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">Step {step.order}</span>
                      {step.minutes && (
                        <Badge variant="outline" className="text-xs">
                          {step.minutes}m
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{step.text}</p>
                  </div>
                </div>
                {index < recipe.steps.length - 1 && (
                  <Separator className="mt-4" />
                )}
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

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="container max-w-2xl mx-auto flex gap-3">
          {!hasMarkedUsed ? (
            <>
              <Button
                onClick={handleStartCooking}
                variant="outline"
                className="flex-1"
              >
                Let's cook
              </Button>
              <Button
                onClick={handleMarkUsed}
                className="flex-1"
              >
                Mark as used
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/suggestion')}
              className="w-full"
            >
              What's next?
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
