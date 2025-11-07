import { PantryItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIngredientEmoji } from '@/utils/ingredientEmojis';

interface PantryItemCardProps {
  item: PantryItem;
  onToggleUsed: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

export const PantryItemCard = ({ item, onToggleUsed, onRemove, onEdit }: PantryItemCardProps) => {
  const displayQty = item.qty ? `${item.qty}${item.unit || ''}` : '';
  const emoji = getIngredientEmoji(item.name);
  
  return (
    <div className={cn(
      "bg-card border rounded-xl p-4 transition-all",
      item.used && "opacity-60 bg-muted"
    )}>
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onEdit(item.id)}
          className="flex-1 space-y-2 text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn(
              "font-semibold text-base capitalize flex items-center gap-2",
              item.used && "line-through"
            )}>
              <span className="text-xl">{emoji}</span>
              {item.name}
            </h3>
            {displayQty && (
              <span className="text-sm text-muted-foreground">
                {displayQty}
              </span>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {item.source === 'photo' && (
              <Badge variant="outline" className="text-xs">
                📸 Detected
              </Badge>
            )}
            {item.confidence && (
              <Badge variant="secondary" className="text-xs">
                {Math.round(item.confidence > 1 ? item.confidence : item.confidence * 100)}%
              </Badge>
            )}
          </div>
        </button>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant={item.used ? "default" : "outline"}
            onClick={() => onToggleUsed(item.id)}
            className="h-10 w-10 rounded-full flex-shrink-0"
          >
            <Check className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRemove(item.id)}
            className="h-10 w-10 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
