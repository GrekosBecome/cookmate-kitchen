import { Clock, Eye, Trash2, Heart } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const favoriteRecipes = viewedRecipes.filter(v => v.isFavorite);
  const displayedRecipes = activeTab === "favorites" ? favoriteRecipes : viewedRecipes;

  const renderRecipeCard = (viewed: ViewedRecipe) => (
    <Card key={viewed.id} className="overflow-hidden hover:bg-accent/5 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
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
          <div className="flex gap-0.5">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggleFavorite(viewed.id)}
              className={`h-8 w-8 ${viewed.isFavorite ? "text-red-500 hover:text-red-600" : ""}`}
            >
              <Heart className={`h-3.5 w-3.5 ${viewed.isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                onViewRecipe(viewed.recipe);
                onOpenChange(false);
              }}
              className="h-8 w-8"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDeleteRecipe(viewed.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-3.5 w-3.5" />
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-5 w-5" />
              <SheetTitle className="text-lg">Recipe History</SheetTitle>
            </div>
            {viewedRecipes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs">
            {viewedRecipes.length} {viewedRecipes.length === 1 ? 'recipe' : 'recipes'} viewed
            {favoriteRecipes.length > 0 && ` • ${favoriteRecipes.length} favorite${favoriteRecipes.length === 1 ? '' : 's'}`}
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "favorites")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All ({viewedRecipes.length})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({favoriteRecipes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
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
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
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
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
