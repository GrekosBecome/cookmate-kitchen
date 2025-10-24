import { Recipe, LearningState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWhyThisReasons } from '@/lib/learning';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  onAnother?: () => void;
  onSkip?: () => void;
  showActions?: boolean;
  learning?: LearningState;
}

export const RecipeCard = ({ recipe, onAnother, onSkip, showActions = true, learning }: RecipeCardProps) => {
  const navigate = useNavigate();
  const whyThisReasons = getWhyThisReasons(recipe.tags, learning);
  const [isAnimating, setIsAnimating] = useState(false);

  const topNeeds = recipe.needs.slice(0, 3);
  const isFastRecipe = recipe.timeMin <= 20;

  const handleCookThis = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate(`/recipe/${recipe.id}`);
    }, 400);
  };

  return (
    <Card className={`overflow-hidden ${isAnimating ? 'animate-chef-bounce' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{recipe.title}</CardTitle>
        <p className="text-sm text-muted-foreground">Ready in {recipe.timeMin} minutes</p>
        <div className="flex gap-2 flex-wrap mt-2">
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
          {isFastRecipe && (
            <Badge variant="secondary">≤20m</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {whyThisReasons.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 rounded-md p-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>
              Because you liked <strong>{whyThisReasons.join(' & ')}</strong> recently
            </span>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-2">Main ingredients:</p>
          <div className="flex gap-2 flex-wrap">
            {topNeeds.map((need) => (
              <Badge key={need} variant="secondary" className="capitalize">
                {need}
              </Badge>
            ))}
            {recipe.needs.length > 3 && (
              <Badge variant="outline">+{recipe.needs.length - 3} more</Badge>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={handleCookThis}
              className="w-full"
              size="lg"
            >
              Cook this
            </Button>
            <div className="flex gap-2">
              {onAnother && (
                <Button 
                  onClick={onAnother}
                  variant="ghost"
                  className="flex-1"
                >
                  Another idea
                </Button>
              )}
              {onSkip && (
                <Button 
                  onClick={onSkip}
                  variant="ghost"
                  size="sm"
                >
                  Skip
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
