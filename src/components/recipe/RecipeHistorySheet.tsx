import { Clock, Eye, Trash2, Heart } from "lucide-react";
import { ViewedRecipe } from "@/types";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const favoriteRecipes = viewedRecipes.filter(v => v.isFavorite);

  const handleRecipeClick = (viewed: ViewedRecipe) => {
    onOpenChange(false);
    onViewRecipe(viewed.recipe);
  };

  const renderRecipeCard = (viewed: ViewedRecipe) => (
    <div
      key={viewed.id} 
      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => handleRecipeClick(viewed)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate mb-1">
            {viewed.recipe.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{viewed.recipe.timeMin}m</span>
            </div>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">
              {viewed.mode}
            </Badge>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(viewed.id);
            }}
            className={`h-8 w-8 ${viewed.isFavorite ? "text-red-500 hover:text-red-600" : ""}`}
            aria-label="Toggle favorite"
          >
            <Heart className={`h-4 w-4 ${viewed.isFavorite ? "fill-current" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRecipe(viewed.id);
            }}
            className="h-8 w-8"
            aria-label="Delete recipe"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Viewed {new Date(viewed.viewedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recipe History
          </SheetTitle>
          <SheetDescription>
            {viewedRecipes.length} {viewedRecipes.length === 1 ? 'recipe' : 'recipes'} viewed
            {favoriteRecipes.length > 0 && ` • ${favoriteRecipes.length} favorite${favoriteRecipes.length === 1 ? '' : 's'}`}
          </SheetDescription>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 glass-card rounded-full mt-4">
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

          {/* Clear All Button */}
          {viewedRecipes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="w-full mt-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All History
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
          {activeTab === "all" ? (
            viewedRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Clock className="h-16 w-16 mb-4 opacity-20" />
                <p>No recipes viewed yet</p>
              </div>
            ) : (
              <div className="space-y-3 pb-6">
                {viewedRecipes.map((viewed) => renderRecipeCard(viewed))}
              </div>
            )
          ) : (
            favoriteRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Heart className="h-16 w-16 mb-4 opacity-20" />
                <p>No favorite recipes yet</p>
                <p className="text-xs mt-2">Tap the heart icon to save your favorites</p>
              </div>
            ) : (
              <div className="space-y-3 pb-6">
                {favoriteRecipes.map((viewed) => renderRecipeCard(viewed))}
              </div>
            )
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
