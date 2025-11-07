import { Clock, Eye, Trash2, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
    <Card key={viewed.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Recipe Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">
              {viewed.recipe.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
              <Clock className="h-3 w-3" />
              <span>{viewed.recipe.timeMin} min</span>
              <span>•</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {viewed.mode}
              </Badge>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(viewed.viewedAt), { 
                  addSuffix: true 
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFavorite(viewed.id)}
              className={viewed.isFavorite ? "text-red-500 hover:text-red-600" : ""}
            >
              <Heart className={`h-4 w-4 ${viewed.isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onViewRecipe(viewed.recipe);
                onOpenChange(false);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteRecipe(viewed.id)}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <SheetTitle>Recipe History</SheetTitle>
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
          <SheetDescription>
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
            <ScrollArea className="h-[calc(100vh-200px)]">
              {viewedRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recipes viewed yet</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {viewedRecipes.map((viewed) => renderRecipeCard(viewed))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {favoriteRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No favorite recipes yet</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tap the heart icon to save your favorites
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
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
