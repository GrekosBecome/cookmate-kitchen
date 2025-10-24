import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getSuggestions } from '@/utils/suggestionEngine';
import { Recipe } from '@/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Suggestion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { preferences, pantryItems, todaysPick, setTodaysPick, addSignal, lastSyncAt, learning, recomputeLearning } = useStore();
  
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const isPantryStale = !lastSyncAt || lastSyncAt < sevenDaysAgo;

  useEffect(() => {
    // Recompute learning on app start
    recomputeLearning();

    // Check if we need new suggestions
    if (!todaysPick || todaysPick.date !== today) {
      generateSuggestions();
    } else {
      // Load cached suggestions
      const cached = todaysPick.recipeIds.map(id => 
        getSuggestions(preferences, pantryItems, 12, learning).find(r => r.id === id)
      ).filter(Boolean) as Recipe[];
      setSuggestions(cached);
      setCurrentIndex(todaysPick.indexShown);
    }
  }, []);

  useEffect(() => {
    // Log viewed signal when suggestions change
    if (suggestions.length > 0 && currentIndex >= 0) {
      const current = suggestions[currentIndex];
      if (current) {
        addSignal({
          ts: new Date().toISOString(),
          type: 'viewed',
          recipeId: current.id,
          tags: current.tags,
          needs: current.needs,
        });
      }
    }
  }, [suggestions, currentIndex]);

  const generateSuggestions = () => {
    const newSuggestions = getSuggestions(preferences, pantryItems, 2, learning);
    setSuggestions(newSuggestions);
    setCurrentIndex(0);
    setSpinCount(0);
    
    if (newSuggestions.length > 0) {
      setTodaysPick({
        date: today,
        recipeIds: newSuggestions.map(r => r.id),
        indexShown: 0,
      });
    }
  };

  const handleAnother = () => {
    if (spinCount >= 2) {
      toast({
        title: "Maximum spins reached",
        description: "Try refreshing your pantry for more variety!",
      });
      return;
    }

    const current = suggestions[currentIndex];
    if (current) {
      addSignal({
        ts: new Date().toISOString(),
        type: 'another',
        recipeId: current.id,
        tags: current.tags,
        needs: current.needs,
      });
    }

    if (currentIndex < suggestions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setTodaysPick({
        date: today,
        recipeIds: suggestions.map(r => r.id),
        indexShown: newIndex,
      });
    } else {
      generateSuggestions();
    }
    
    setSpinCount(prev => prev + 1);
  };

  const handleSkip = () => {
    const current = suggestions[currentIndex];
    if (current) {
      addSignal({
        ts: new Date().toISOString(),
        type: 'skip',
        recipeId: current.id,
        tags: current.tags,
        needs: current.needs,
      });
    }

    toast({
      title: "Skipped",
      description: "We'll remember your preference!",
    });

    handleAnother();
  };

  const handleSimpleEggs = () => {
    navigate('/recipe/scrambled-eggs-toast');
  };

  const handleOpenChat = () => {
    const recipeId = currentRecipe?.id;
    if (recipeId) {
      navigate(`/chat?recipeId=${recipeId}`);
    } else {
      navigate('/chat');
    }
  };

  const currentRecipe = suggestions[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <header className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-bold">Today's ideas 🍳</h1>
          <p className="text-muted-foreground">
            Chef picked these just for you
          </p>
        </header>

        {isPantryStale && (
          <Alert className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pantry last updated {Math.floor((Date.now() - new Date(lastSyncAt).getTime()) / (1000 * 60 * 60 * 24))} days ago — ready for a fresh scan?
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate('/pantry')}
            >
              Refresh Pantry
            </Button>
          </Alert>
        )}

        <div className="space-y-4">
          {currentRecipe ? (
            <div className="animate-fade-in">
              <RecipeCard
                recipe={currentRecipe}
                onAnother={handleAnother}
                onSkip={handleSkip}
                learning={learning}
              />
            </div>
          ) : (
            <div className="text-center space-y-4 py-8 animate-fade-in">
              <p className="text-muted-foreground">
                Your fridge is empty — and that's okay. Let's fill it up 🥦
              </p>
              <Button onClick={handleSimpleEggs} variant="outline">
                Start simple: Eggs & Toast
              </Button>
            </div>
          )}
        </div>

        {spinCount > 0 && (
          <p className="text-center text-sm text-muted-foreground animate-fade-in">
            {spinCount}/2 new ideas shown
          </p>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/pantry')}
          >
            Manage Pantry
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/settings')}
          >
            Settings
          </Button>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={handleOpenChat}
              className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-all duration-200 animate-breathe"
            >
              <ChefHat className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Ask the Chef</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Suggestion;
