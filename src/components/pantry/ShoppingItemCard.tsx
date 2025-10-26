import { useState } from 'react';
import { ShoppingItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onCheck: () => void;
  onRemove: () => void;
}

export function ShoppingItemCard({
  item,
  onCheck,
  onRemove,
}: ShoppingItemCardProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    setIsChecking(true);
    setTimeout(() => onCheck(), 300);
  };

  const reasonText =
    item.reason === 'used_up'
      ? 'Used up'
      : item.reason === 'missing_from_recipe'
      ? 'Missing from recipe'
      : 'Low stock';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-card border rounded-xl transition-all duration-300',
        isChecking && 'opacity-0 scale-95'
      )}
    >
      <Checkbox checked={item.bought} onCheckedChange={handleCheck} />
      <div className="flex-1">
        <h4 className="font-medium capitalize">{item.name}</h4>
        <p className="text-sm text-muted-foreground">
          {reasonText}
          {item.suggestedQty && ` • ${item.suggestedQty}${item.unit || ''}`}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
