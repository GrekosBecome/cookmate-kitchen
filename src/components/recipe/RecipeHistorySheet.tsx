import { Clock, Eye, Trash2, Heart, ArrowLeft } from "lucide-react";
import { ViewedRecipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface RecipeHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewedRecipes: ViewedRecipe[];
  onViewRecipe: (recipe: any) => void;
  onDeleteRecipe: (id: string) => void;
  onClearAll: () => void;
  onToggleFavorite: (id: string) => void;
}

export const RecipeHistorySheet = ({
  open,
  onOpenChange,
  viewedRecipes,
  onViewRecipe,
  onDeleteRecipe,
  onClearAll,
  onToggleFavorite
}: RecipeHistorySheetProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const favoriteRecipes = viewedRecipes.filter(v => v.isFavorite);
  const displayedRecipes = activeTab === "favorites" ? favoriteRecipes : viewedRecipes;
  const expandedRecipe = expandedRecipeId ? viewedRecipes.find(v => v.id === expandedRecipeId) : null;

  const renderRecipeCard = (viewed: ViewedRecipe) => (
    <Card 
      key={viewed.id} 
      className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer"
      onClick={() => setExpandedRecipeId(viewed.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Recipe Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {viewed.recipe.title}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{viewed.recipe.timeMin}m</span>
              <span>•</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">
                {viewed.mode}
              </Badge>
            </div>
          </div>

          {/* Compact Actions */}
          <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggleFavorite(viewed.id)}
              className={`h-8 w-8 ${viewed.isFavorite ? "text-red-500 hover:text-red-600" : ""}`}
              aria-label="Toggle favorite"
            >
              <Heart className={`h-4 w-4 ${viewed.isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDeleteRecipe(viewed.id)}
              className="h-8 w-8"
              aria-label="Delete recipe"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between pr-12">
            <div className="flex items-center gap-1.5">
              <Clock className="h-5 w-5" />
              <SheetTitle className="text-lg">Recipe History</SheetTitle>
            </div>
            {viewedRecipes.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClearAll}
                aria-label="Clear all recipes"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs">
            {viewedRecipes.length} {viewedRecipes.length === 1 ? 'recipe' : 'recipes'} viewed
            {favoriteRecipes.length > 0 && ` • ${favoriteRecipes.length} favorite${favoriteRecipes.length === 1 ? '' : 's'}`}
          </SheetDescription>
        </SheetHeader>

        {expandedRecipe ? (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedRecipeId(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </Button>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-2">{expandedRecipe.recipe.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{expandedRecipe.recipe.timeMin} min</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {expandedRecipe.mode}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onToggleFavorite(expandedRecipe.id)}
                    className={`h-9 w-9 ${expandedRecipe.isFavorite ? "text-red-500 hover:text-red-600" : ""}`}
                    aria-label="Toggle favorite"
                  >
                    <Heart className={`h-5 w-5 ${expandedRecipe.isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteRecipe(expandedRecipe.id)}
                    className="h-9 w-9"
                    aria-label="Delete recipe"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-6 pr-4">
                  <div>
                    <h4 className="font-medium mb-3">Ingredients</h4>
                    <ul className="space-y-2">
                      {expandedRecipe.recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            {ingredient.qty && ingredient.unit ? `${ingredient.qty}${ingredient.unit} ` : ''}
                            {ingredient.name}
                            {ingredient.optional ? ' (optional)' : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Steps</h4>
                    <ol className="space-y-3">
                      {expandedRecipe.recipe.steps.map((step) => (
                        <li key={step.order} className="text-sm flex gap-3">
                          <span className="font-medium text-primary shrink-0">{step.order}.</span>
                          <span>
                            {step.text}
                            {step.minutes && <span className="text-muted-foreground ml-1">({step.minutes}min)</span>}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="mt-2 w-full">
            <div className="grid grid-cols-2 gap-2 p-1 glass-card rounded-full">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({viewedRecipes.length})
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "favorites"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Favorites ({favoriteRecipes.length})
              </button>
            </div>

            {activeTab === "all" ? (
              <ScrollArea className="h-[calc(100vh-220px)] mt-4">
                {viewedRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No recipes viewed yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-2">
                    {viewedRecipes.map((viewed) => renderRecipeCard(viewed))}
                  </div>
                )}
              </ScrollArea>
            ) : (
              <ScrollArea className="h-[calc(100vh-220px)] mt-4">
                {favoriteRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No favorite recipes yet</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Tap the heart icon to save your favorites
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-2">
                    {favoriteRecipes.map((viewed) => renderRecipeCard(viewed))}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
