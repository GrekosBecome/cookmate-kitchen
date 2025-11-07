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
import { AlertCircle, Sparkles, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FloatingButtons } from '@/components/FloatingButtons';
import { track } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';
import { RecipeHistorySheet } from '@/components/recipe/RecipeHistorySheet';
import { Badge } from '@/components/ui/badge';
const Suggestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
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
    lastAIGeneration,
    viewedRecipes,
    addViewedRecipe,
    removeViewedRecipe,
    clearViewedRecipes,
    toggleViewedRecipeFavorite
  } = useStore();
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [useAI, setUseAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImprovising, setIsImprovising] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const isPantryStale = !lastSyncAt || lastSyncAt < sevenDaysAgo;

  // Check if AI mode should be enabled (>= 3 shopping items)
  const canUseAI = shoppingState.queue.length >= 3;

  // Check if we have recent AI results (< 24h old)
  const hasRecentAI = lastAIGeneration && Date.now() - new Date(lastAIGeneration).getTime() < 24 * 60 * 60 * 1000;
  useEffect(() => {
    track('opened_screen', {
      screen: 'suggestion'
    });

    // Check if coming from Pantry AI generation (Gourmet mode)
    const locationState = location.state as {
      aiRecipes?: Recipe[];
    };
    if (locationState?.aiRecipes) {
      setAIGeneratedRecipes(locationState.aiRecipes);
      setSuggestions(locationState.aiRecipes);
      setCurrentIndex(0);
      setUseAI(true);
      setSpinCount(0);

      // Save to cache
      // Save only first recipe to cache
      const firstRecipe = locationState.aiRecipes[0];
      if (firstRecipe) {
        setTodaysPick({
          date: today,
          recipeIds: [firstRecipe.id],
          indexShown: 0,
          mode: 'ai',
          suggestions: [firstRecipe]
        });
      }

      // Clear the state to prevent re-rendering
      window.history.replaceState({}, document.title);
      return;
    }

    // Recompute learning on app start
    recomputeLearning();

    // Hybrid approach: Check for cached AI recipes first (< 24h old)
    if (hasRecentAI && aiGeneratedRecipes.length > 0) {
      // Use cached AI recipes (from background fetch)
      setSuggestions(aiGeneratedRecipes);
      setUseAI(false); // Still classic mode UI, just AI-powered
      setCurrentIndex(0);
      console.log('✨ Using cached AI recipes');
    } else if (!todaysPick || todaysPick.date !== today) {
      // First visit or new day: Show static instantly + background fetch AI
      generateSuggestions();
    } else {
      // Restore only last viewed recipe from cache
      if (todaysPick.suggestions && todaysPick.suggestions.length > 0) {
        const lastViewed = todaysPick.suggestions[todaysPick.indexShown || 0];
        
        if (lastViewed) {
          setSuggestions([lastViewed]);
          setCurrentIndex(0);
          setUseAI(todaysPick.mode === 'ai' || todaysPick.mode === 'improvised');
        } else {
          generateSuggestions();
        }
      } else {
        // Fallback: regenerate if no cached suggestions
        generateSuggestions();
      }
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
          needs: current.needs
        });
        
        // Auto-save to history
        const mode = useAI ? 'ai' : isImprovising ? 'improvised' : 'classic';
        addViewedRecipe(current, mode);
        
        // Update todaysPick to keep ONLY current recipe
        setTodaysPick({
          date: today,
          recipeIds: [current.id],
          indexShown: 0,
          mode: mode,
          suggestions: [current]
        });
      }
    }
  }, [suggestions, currentIndex, useAI, isImprovising]);
  const generateSuggestions = () => {
    const newSuggestions = getSuggestions(preferences, pantryItems, 2, learning);

    // If no matches found and not enough items, show empty state
    if (newSuggestions.length === 0 && pantryItems.length < 3) {
      setSuggestions([]);
      setCurrentIndex(0);
      return;
    }

    // Show static results immediately (instant feedback)
    setSuggestions(newSuggestions);
    setCurrentIndex(0);
    setSpinCount(0);
    setUseAI(false);
    // Save only first recipe to cache
    if (newSuggestions.length > 0) {
      const firstRecipe = newSuggestions[0];
      setTodaysPick({
        date: today,
        recipeIds: [firstRecipe.id],
        indexShown: 0,
        mode: 'classic',
        suggestions: [firstRecipe]
      });
    }

    // Background: Fetch AI recipes for next time (if we have enough items)
    if (pantryItems.length >= 3) {
      backgroundFetchAI();
    }
  };
  const backgroundFetchAI = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-gourmet-recipes', {
        body: {
          shoppingItems: shoppingState.queue,
          pantryItems: pantryItems.slice(0, 10),
          preferences,
          mode: 'everyday'
        }
      });
      if (error || data?.error) {
        console.log('Background AI fetch failed, will use static next time');
        return;
      }
      if (data?.recipes && data.recipes.length > 0) {
        // Cache for next time
        setAIGeneratedRecipes(data.recipes);
        console.log(`✨ ${data.recipes.length} AI recipes cached for next visit`);
      }
    } catch (error) {
      console.error('Background AI fetch error:', error);
    }
  };
  const improviseRecipe = async () => {
    setIsImprovising(true);
    track('improvise_recipe_requested', {
      pantryCount: pantryItems.length
    });
    try {
      // Pick 2-3 random ingredients as "stars"
      const shuffled = [...pantryItems].sort(() => Math.random() - 0.5);
      const starIngredients = shuffled.slice(0, Math.min(3, shuffled.length));
      const starNames = starIngredients.map(i => i.name);
      toast({
        title: "🎨 Chef is improvising...",
        description: `Creating something with ${starNames.join(', ')}`
      });
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-gourmet-recipes', {
        body: {
          shoppingItems: [],
          pantryItems: pantryItems.slice(0, 10),
          starIngredients: starNames,
          preferences,
          mode: 'improvise'
        }
      });
      if (error || data?.error) {
        throw new Error(data?.message || 'Improvisation failed');
      }
      if (data?.recipes && data.recipes.length > 0) {
        // Add the new recipe to local suggestions
        const newSuggestions = [...suggestions, ...data.recipes];
        setSuggestions(newSuggestions);
        const newIndex = suggestions.length;
        setCurrentIndex(newIndex); // Jump to the new recipe

        // Store in global state so RecipeDetail can find it
        setAIGeneratedRecipes([...aiGeneratedRecipes, ...data.recipes]);

        // Save only the new improvised recipe to cache
        const newRecipe = data.recipes[0];
        if (newRecipe) {
          setTodaysPick({
            date: today,
            recipeIds: [newRecipe.id],
            indexShown: 0,
            mode: 'improvised',
            suggestions: [newRecipe]
          });
        }

        track('improvise_recipe_success', {
          starIngredients: starNames
        });
        toast({
          title: "✨ Fresh creation ready!",
          description: "The chef outdid themselves!"
        });
      }
    } catch (error) {
      console.error('Improvisation error:', error);
      toast({
        title: "Oops!",
        description: "The chef's creativity ran out. Try refreshing your pantry!",
        variant: "destructive"
      });
      track('improvise_recipe_failed', {
        reason: 'error'
      });
    } finally {
      setIsImprovising(false);
    }
  };
  const generateAIRecipes = async () => {
    setIsGenerating(true);
    setAiError(null);
    track('ai_generation_requested', {
      itemCount: shoppingState.queue.length
    });
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-gourmet-recipes', {
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
          track('ai_generation_failed', {
            reason: 'rate_limit'
          });
        } else if (data.error === 'payment_required') {
          setAiError('Credits exhausted. Please add credits to continue.');
          track('ai_generation_failed', {
            reason: 'payment_required'
          });
        } else {
          throw new Error(data.message || 'Failed to generate recipes');
        }
        toast({
          title: "Generation failed",
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

        // Save only first AI recipe to cache
        const firstRecipe = data.recipes[0];
        if (firstRecipe) {
          setTodaysPick({
            date: today,
            recipeIds: [firstRecipe.id],
            indexShown: 0,
            mode: 'ai',
            suggestions: [firstRecipe]
          });
        }

        track('ai_generation_success', {
          recipeCount: data.recipes.length
        });
        toast({
          title: "✨ Gourmet recipes ready!",
          description: `${data.recipes.length} chef-crafted recipes based on your list`
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError('Failed to generate recipes. Using classic suggestions instead.');
      track('ai_generation_failed', {
        reason: 'error'
      });
      toast({
        title: "Couldn't generate recipes",
        description: "Showing our classic suggestions instead.",
        variant: "destructive"
      });
      generateSuggestions();
    } finally {
      setIsGenerating(false);
    }
  };
  const handleAnother = () => {
    track('clicked_cta', {
      action: 'another',
      mode: useAI ? 'ai' : 'classic'
    });
    addRecentAction('another');
    const current = suggestions[currentIndex];
    if (current) {
      addSignal({
        ts: new Date().toISOString(),
        type: 'another',
        recipeId: current.id,
        tags: current.tags,
        needs: current.needs
      });
    }
    if (currentIndex < suggestions.length - 1) {
      // Navigate to next existing recipe
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Update cache to keep ONLY the new suggestion
      const newSuggestion = suggestions[newIndex];
      if (newSuggestion) {
        setTodaysPick({
          date: today,
          recipeIds: [newSuggestion.id],
          indexShown: 0,
          mode: useAI ? 'ai' : 'classic',
          suggestions: [newSuggestion]
        });
      }
    } else {
      // End of suggestions - TIME TO IMPROVISE! 🎨
      if (pantryItems.length >= 2) {
        improviseRecipe();
      } else {
        toast({
          title: "Need more ingredients",
          description: "Add at least 2 items to your pantry for the chef to get creative!"
        });
      }
    }
    setSpinCount(prev => prev + 1);
  };
  const handleSkip = () => {
    track('clicked_cta', {
      action: 'skip'
    });
    addRecentAction('skip');
    const current = suggestions[currentIndex];
    if (current) {
      addSignal({
        ts: new Date().toISOString(),
        type: 'skip',
        recipeId: current.id,
        tags: current.tags,
        needs: current.needs
      });
    }
    toast({
      title: "Skipped",
      description: "We'll remember your preference!"
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
  
  const handleViewRecipeFromHistory = (recipe: Recipe) => {
    // Load only this recipe from history
    setSuggestions([recipe]);
    setCurrentIndex(0);
    setUseAI(recipe.aiGenerated || false);
    setIsImprovising(false);
    setShowHistory(false);
    
    // Update today's pick
    setTodaysPick({
      date: today,
      recipeIds: [recipe.id],
      indexShown: 0,
      mode: recipe.aiGenerated ? 'ai' : 'classic',
      suggestions: [recipe]
    });
    
    toast({
      title: "Recipe loaded",
      description: `Viewing ${recipe.title} again`
    });
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
      const daysSinceLastCook = Math.floor((Date.now() - new Date(memory.lastCookDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastCook === 0) return `${memory.lastRecipeName} was tasty! Ready for another?`;
      if (daysSinceLastCook === 1) return `Back for more? Yesterday's ${memory.lastRecipeName} was great.`;
      if (daysSinceLastCook < 7) return `Haven't cooked in ${daysSinceLastCook} days — let's change that 🍳`;
    }
    return "Chef picked these just for you";
  };
  return <div className="min-h-screen bg-background" style={{
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)'
  }}>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {getContextMessage()}
            </p>
          </div>
          
          {/* History Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="relative flex-shrink-0"
          >
            <Clock className="h-5 w-5" />
            {viewedRecipes.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {viewedRecipes.length}
              </Badge>
            )}
          </Button>
        </header>

        {/* AI Gourmet Mode CTA */}
        {canUseAI && !useAI && !isGenerating && <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 mt-0.5 flex-shrink-0 text-primary animate-pulse" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    Ready for Gourmet Recipes?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {shoppingState.queue.length} ingredients ready — create restaurant-quality recipes
                  </p>
                </div>
                <Button onClick={generateAIRecipes} size="sm" className="flex-shrink-0 gap-1">
                  <Sparkles className="h-3 w-3" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>}

        {/* Shopping reminder card */}
        {pendingItems.length > 0 && !canUseAI && <Card className="bg-accent/20 border-accent animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">Running low on essentials 🛍️</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {pendingItems.length} {pendingItems.length === 1 ? 'item' : 'items'} waiting on your shopping list
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/pantry?tab=shopping')} className="flex-shrink-0">
                  Show me
                </Button>
              </div>
            </CardContent>
          </Card>}

        {/* AI Error Alert */}
        {aiError && <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>}


        <div className="space-y-4">
          {isGenerating || isImprovising ? <Card className="animate-fade-in">
              <CardContent className="p-12 text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {isImprovising ? 'Chef is improvising...' : 'Crafting gourmet recipes...'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isImprovising ? 'Creating something special just for you' : 'Our chef is creating something special'}
                  </p>
                </div>
              </CardContent>
            </Card> : currentRecipe ? <div className="animate-fade-in">
              {useAI ? <GourmetRecipeCard recipe={currentRecipe} onAnother={handleAnother} /> : <div className="space-y-2">
                  <RecipeCard recipe={currentRecipe} onAnother={handleAnother} learning={learning} />
                </div>}
            </div> : <div className="text-center space-y-4 py-8 animate-fade-in">
              <p className="text-sm sm:text-base text-muted-foreground">
                Your fridge is empty — let's fill it up 🥦
              </p>
              <Button onClick={handleSimpleEggs} variant="outline" className="h-11">
                Start simple: Scrambled eggs
              </Button>
            </div>}
        </div>

        {/* Mode Toggle */}
        {suggestions.length > 0 && !isGenerating && !useAI && canUseAI && <div className="flex justify-center gap-2 animate-fade-in">
            <Button variant="outline" size="sm" onClick={generateAIRecipes} className="gap-1">
              <Sparkles className="h-3 w-3" />
              Try Gourmet
            </Button>
          </div>}

        {spinCount > 0 && !useAI}
      </div>

      {/* Recipe History Sheet */}
      <RecipeHistorySheet
        open={showHistory}
        onOpenChange={setShowHistory}
        viewedRecipes={viewedRecipes}
        onViewRecipe={handleViewRecipeFromHistory}
        onDeleteRecipe={removeViewedRecipe}
        onToggleFavorite={toggleViewedRecipeFavorite}
        onClearAll={() => {
          clearViewedRecipes();
          toast({ 
            title: "History cleared",
            description: "All viewed recipes have been removed"
          });
        }}
      />

      <FloatingButtons recipeId={currentRecipe?.id} />
    </div>;
};
export default Suggestion;