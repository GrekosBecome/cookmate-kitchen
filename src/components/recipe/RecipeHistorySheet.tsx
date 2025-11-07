import { Clock, Eye, Trash2 } from "lucide-react";
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

interface RecipeHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewedRecipes: ViewedRecipe[];
  onViewRecipe: (recipe: any) => void;
  onDeleteRecipe: (id: string) => void;
  onClearAll: () => void;
}

export const RecipeHistorySheet = ({
  open,
  onOpenChange,
  viewedRecipes,
  onViewRecipe,
  onDeleteRecipe,
  onClearAll
}: RecipeHistorySheetProps) => {
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
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {viewedRecipes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No recipes viewed yet</p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {viewedRecipes.map((viewed) => (
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
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
