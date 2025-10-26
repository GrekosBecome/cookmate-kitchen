import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getSuggestions } from '@/utils/suggestionEngine';
import { Recipe } from '@/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FloatingButtons } from '@/components/FloatingButtons';
import { track } from '@/lib/analytics';

const Suggestion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    preferences, 
    pantryItems, 
    todaysPick, 
    setTodaysPick, 
    addSignal, 
    lastSyncAt, 
    learning, 
    recomputeLearning, 
    shoppingState,
    memory,
    updateMemory,
    addRecentAction
  } = useStore();
  
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const isPantryStale = !lastSyncAt || lastSyncAt < sevenDaysAgo;

  useEffect(() => {
    track('opened_screen', { screen: 'suggestion' });
    
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
    track('clicked_cta', { action: 'another' });
    addRecentAction('another');
    
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
    track('clicked_cta', { action: 'skip' });
    addRecentAction('skip');
    
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
  const pendingItems = shoppingState.queue.filter(i => !i.bought);
  
  // Dynamic greeting based on memory
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Afternoon cravings";
    return "Evening ideas";
  };
  
  const getContextMessage = () => {
    if (memory.lastRecipeName && memory.lastCookDate) {
      const daysSinceLastCook = Math.floor(
        (Date.now() - new Date(memory.lastCookDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastCook === 0) return `${memory.lastRecipeName} was tasty! Ready for another?`;
      if (daysSinceLastCook === 1) return `Back for more? Yesterday's ${memory.lastRecipeName} was great.`;
      if (daysSinceLastCook < 7) return `Haven't cooked in ${daysSinceLastCook} days — let's change that 🍳`;
    }
    
    return "Chef picked these just for you";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()} 🍳</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {getContextMessage()}
          </p>
        </header>

        {/* Shopping reminder card */}
        {pendingItems.length > 0 && (
          <Card className="bg-accent/20 border-accent animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">Running low on essentials 🛍️</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {pendingItems.length} {pendingItems.length === 1 ? 'item' : 'items'} waiting on your shopping list
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/pantry?tab=shopping')}
                  className="flex-shrink-0"
                >
                  Show me
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isPantryStale && (
          <Alert className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Pantry last updated {Math.floor((Date.now() - new Date(lastSyncAt).getTime()) / (1000 * 60 * 60 * 24))} days ago — ready for a fresh scan?
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 h-9"
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
              <p className="text-sm sm:text-base text-muted-foreground">
                Your fridge is empty — let's fill it up 🥦
              </p>
              <Button onClick={handleSimpleEggs} variant="outline" className="h-11">
                Start simple: Scrambled eggs
              </Button>
            </div>
          )}
        </div>

        {spinCount > 0 && (
          <p className="text-center text-xs sm:text-sm text-muted-foreground animate-fade-in">
            {spinCount}/2 new ideas shown
          </p>
        )}
      </div>

      <FloatingButtons recipeId={currentRecipe?.id} />
    </div>
  );
};

export default Suggestion;
