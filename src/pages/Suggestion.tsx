import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getSuggestions } from '@/utils/suggestionEngine';
import { Recipe } from '@/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { GourmetRecipeCard } from '@/components/recipe/GourmetRecipeCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FloatingButtons } from '@/components/FloatingButtons';
import { track } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';

const Suggestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    addRecentAction,
    aiGeneratedRecipes,
    setAIGeneratedRecipes,
    clearAIGeneratedRecipes,
    lastAIGeneration
  } = useStore();
  
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [useAI, setUseAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const isPantryStale = !lastSyncAt || lastSyncAt < sevenDaysAgo;
  
  // Check if AI mode should be enabled (>= 3 shopping items)
  const canUseAI = shoppingState.queue.length >= 3;
  
  // Check if we have recent AI results (< 24h old)
  const hasRecentAI = lastAIGeneration && 
    (Date.now() - new Date(lastAIGeneration).getTime()) < 24 * 60 * 60 * 1000;

  useEffect(() => {
    track('opened_screen', { screen: 'suggestion' });
    
    // Check if coming from Pantry AI generation
    const locationState = location.state as { aiRecipes?: Recipe[] };
    if (locationState?.aiRecipes) {
      setAIGeneratedRecipes(locationState.aiRecipes);
      setSuggestions(locationState.aiRecipes);
      setCurrentIndex(0);
      setUseAI(true);
      setSpinCount(0);
      
      // Clear the state to prevent re-rendering
      window.history.replaceState({}, document.title);
      return;
    }
    
    // Recompute learning on app start
    recomputeLearning();

    // Load AI recipes if available and recent
    if (hasRecentAI && aiGeneratedRecipes.length > 0) {
      setSuggestions(aiGeneratedRecipes);
      setUseAI(true);
      setCurrentIndex(0);
    } else if (!todaysPick || todaysPick.date !== today) {
      generateSuggestions();
    } else {
      // Load cached suggestions
      const cached = todaysPick.recipeIds.map(id => 
        getSuggestions(preferences, pantryItems, 12, learning).find(r => r.id === id)
      ).filter(Boolean) as Recipe[];
      setSuggestions(cached);
      setCurrentIndex(todaysPick.indexShown);
    }
  }, [location.state]);

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
    
    // AI fallback: If no matches found and we have enough items, use AI
    if (newSuggestions.length === 0 && pantryItems.length >= 3) {
      console.log('No static matches found, falling back to AI everyday recipes...');
      generateAIRecipes();
      return;
    }
    
    setSuggestions(newSuggestions);
    setCurrentIndex(0);
    setSpinCount(0);
    setUseAI(false);
    
    if (newSuggestions.length > 0) {
      setTodaysPick({
        date: today,
        recipeIds: newSuggestions.map(r => r.id),
        indexShown: 0,
      });
    }
  };

  const generateAIRecipes = async () => {
    setIsGenerating(true);
    setAiError(null);
    track('ai_generation_requested', { itemCount: shoppingState.queue.length });

    try {
      const { data, error } = await supabase.functions.invoke('generate-gourmet-recipes', {
        body: {
          shoppingItems: shoppingState.queue,
          pantryItems: pantryItems.slice(0, 10),
          preferences,
          mode: shoppingState.queue.length >= 3 ? 'gourmet' : 'everyday'
        }
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error === 'rate_limit') {
          setAiError('Too many requests. Please try again in a moment.');
          track('ai_generation_failed', { reason: 'rate_limit' });
        } else if (data.error === 'payment_required') {
          setAiError('AI credits exhausted. Please add credits to continue.');
          track('ai_generation_failed', { reason: 'payment_required' });
        } else {
          throw new Error(data.message || 'Failed to generate recipes');
        }
        
        toast({
          title: "AI generation failed",
          description: data.message,
          variant: "destructive"
        });
        return;
      }

      if (data?.recipes && data.recipes.length > 0) {
        setAIGeneratedRecipes(data.recipes);
        setSuggestions(data.recipes);
        setCurrentIndex(0);
        setUseAI(true);
        setSpinCount(0);
        
        track('ai_generation_success', { recipeCount: data.recipes.length });
        
        toast({
          title: "✨ Gourmet recipes ready!",
          description: `${data.recipes.length} chef-crafted recipes based on your list`,
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError('Failed to generate recipes. Using classic suggestions instead.');
      track('ai_generation_failed', { reason: 'error' });
      
      toast({
        title: "Couldn't generate AI recipes",
        description: "Showing our classic suggestions instead.",
        variant: "destructive"
      });
      
      generateSuggestions();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnother = () => {
    track('clicked_cta', { action: 'another', mode: useAI ? 'ai' : 'classic' });
    addRecentAction('another');
    
    if (spinCount >= 2 && !useAI) {
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
      if (!useAI) {
        setTodaysPick({
          date: today,
          recipeIds: suggestions.map(r => r.id),
          indexShown: newIndex,
        });
      }
    } else if (useAI) {
      // For AI mode, generate new recipes
      generateAIRecipes();
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
    <div 
      className="min-h-screen bg-background"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
      }}
    >
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()} 🍳</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {getContextMessage()}
          </p>
        </header>

        {/* AI Gourmet Mode CTA */}
        {canUseAI && !useAI && !isGenerating && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 mt-0.5 flex-shrink-0 text-primary animate-pulse" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    Ready for Gourmet AI?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {shoppingState.queue.length} ingredients ready — let AI create restaurant-quality recipes
                  </p>
                </div>
                <Button 
                  onClick={generateAIRecipes}
                  size="sm"
                  className="flex-shrink-0 gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shopping reminder card */}
        {pendingItems.length > 0 && !canUseAI && (
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

        {/* AI Error Alert */}
        {aiError && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}


        <div className="space-y-4">
          {isGenerating ? (
            <Card className="animate-fade-in">
              <CardContent className="p-12 text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Crafting gourmet recipes...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our AI chef is creating something special
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : currentRecipe ? (
            <div className="animate-fade-in">
              {useAI ? (
                <GourmetRecipeCard
                  recipe={currentRecipe}
                  onAnother={handleAnother}
                />
              ) : (
                <RecipeCard
                  recipe={currentRecipe}
                  onAnother={handleAnother}
                  onSkip={handleSkip}
                  learning={learning}
                />
              )}
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

        {/* Mode Toggle */}
        {suggestions.length > 0 && !isGenerating && !useAI && canUseAI && (
          <div className="flex justify-center gap-2 animate-fade-in">
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateAIRecipes}
              className="gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Try AI Gourmet
            </Button>
          </div>
        )}

        {spinCount > 0 && !useAI && (
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
