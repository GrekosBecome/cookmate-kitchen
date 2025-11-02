import { Recipe } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Flame, Sparkles, ChefHat, Wine, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GourmetRecipeCardProps {
  recipe: Recipe & {
    difficulty?: 'easy' | 'medium' | 'hard';
    cuisine?: string;
    platingTips?: string;
    winePairing?: string;
  };
  onAnother?: () => void;
  showActions?: boolean;
}

const difficultyStars = {
  easy: '⭐',
  medium: '⭐⭐',
  hard: '⭐⭐⭐'
};

export const GourmetRecipeCard = ({ recipe, onAnother, showActions = true }: GourmetRecipeCardProps) => {
  const navigate = useNavigate();
  const { pantryItems } = useStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPlating, setShowPlating] = useState(false);

  const handleCookThis = () => {
    setIsAnimating(true);
    
    // Calculate what user has vs needs based on pantry
    const pantryNames = pantryItems.map(p => p.name.toLowerCase());
    
    const have = recipe.ingredients
      .filter(ing => !ing.optional)
      .filter(ing => {
        const ingName = ing.name.toLowerCase();
        return pantryNames.some(p => 
          p.includes(ingName) || ingName.includes(p)
        );
      })
      .map(ing => ing.name);
    
    const need = recipe.ingredients
      .filter(ing => !ing.optional)
      .filter(ing => {
        const ingName = ing.name.toLowerCase();
        return !pantryNames.some(p => 
          p.includes(ingName) || ingName.includes(p)
        );
      })
      .map(ing => ing.name);
    
    // Navigate to chat with pre-seeded context
    setTimeout(() => {
      const params = new URLSearchParams({
        recipeTitle: recipe.title,
        have: have.join(','),
        need: need.join(','),
      });
      navigate(`/chat?${params.toString()}`);
    }, 400);
  };

  return (
    <Card className={`overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-accent/5 ${isAnimating ? 'animate-chef-bounce' : ''}`}>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3" />
                Gourmet
              </Badge>
              {recipe.cuisine && (
                <Badge variant="outline" className="gap-1">
                  <ChefHat className="h-3 w-3" />
                  {recipe.cuisine}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl sm:text-2xl leading-tight">{recipe.title}</CardTitle>
          </div>
          {recipe.difficulty && (
            <span className="text-xl sm:text-2xl" title={`Difficulty: ${recipe.difficulty}`}>
              {difficultyStars[recipe.difficulty]}
            </span>
          )}
        </div>

        {recipe.description && (
          <p className="text-sm text-muted-foreground italic">
            {recipe.description}
          </p>
        )}

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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Key Ingredients:</p>
          <div className="flex gap-2 flex-wrap">
            {recipe.ingredients.slice(0, 5).map((ing, idx) => (
              <Badge key={idx} variant="secondary" className="capitalize">
                {ing.name}
              </Badge>
            ))}
            {recipe.ingredients.length > 5 && (
              <Badge variant="outline">+{recipe.ingredients.length - 5} more</Badge>
            )}
          </div>
        </div>

        {recipe.platingTips && (
          <Collapsible open={showPlating} onOpenChange={setShowPlating}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-auto py-2">
                <UtensilsCrossed className="h-4 w-4" />
                <span className="text-sm">Plating Tips</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="bg-accent/30 rounded-lg p-3 text-sm text-muted-foreground">
                {recipe.platingTips}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {recipe.winePairing && (
          <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3">
            <Wine className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary mb-1">Perfect Pairing</p>
              <p className="text-sm text-muted-foreground">{recipe.winePairing}</p>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={handleCookThis}
              className="w-full"
              size="lg"
            >
              Cook this masterpiece
            </Button>
            {onAnother && (
              <Button 
                onClick={onAnother}
                variant="outline"
                className="w-full"
              >
                Show me another
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
