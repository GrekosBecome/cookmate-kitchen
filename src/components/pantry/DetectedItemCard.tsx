import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DetectedItem, PantryUnit } from '@/types';
import { cn } from '@/lib/utils';
import { getIngredientEmoji } from '@/utils/ingredientEmojis';

interface DetectedItemCardProps {
  item: DetectedItem;
  onUpdate: (id: string, name: string, qty: number, unit: PantryUnit) => void;
  onRemove: (id: string) => void;
}

const UNITS: PantryUnit[] = ['pcs', 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup'];

export const DetectedItemCard = ({ item, onUpdate, onRemove }: DetectedItemCardProps) => {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<PantryUnit>('pcs');
  const [isEdited, setIsEdited] = useState(false);
  const emoji = getIngredientEmoji(name);

  const handleNameChange = (value: string) => {
    setName(value);
    setIsEdited(true);
    onUpdate(item.id, value, qty, unit);
  };

  const handleQtyChange = (value: string) => {
    const numValue = parseFloat(value) || 1;
    setQty(numValue);
    setIsEdited(true);
    onUpdate(item.id, name, numValue, unit);
  };

  const handleUnitChange = (value: PantryUnit) => {
    setUnit(value);
    setIsEdited(true);
    onUpdate(item.id, name, qty, value);
  };

  const confidenceColor = 
    item.confidence >= 0.85 ? 'bg-secondary' : 
    item.confidence >= 0.70 ? 'bg-accent' : 
    'bg-muted';

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="h-9 font-medium"
            />
            {isEdited && (
              <Check className="h-4 w-4 text-secondary flex-shrink-0" />
            )}
          </div>
          <Badge variant="secondary" className={cn("text-xs", confidenceColor)}>
            {Math.round(item.confidence * 100)}% confident
          </Badge>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors flex-shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          min="0.1"
          step="0.1"
          value={qty}
          onChange={(e) => handleQtyChange(e.target.value)}
          placeholder="Qty"
          className="h-10"
        />
        <Select value={unit} onValueChange={handleUnitChange}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
