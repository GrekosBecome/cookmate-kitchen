import { useState, useEffect } from 'react';
import { PantryItem, PantryUnit } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface EditPantryItemDialogProps {
  item: PantryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, name: string, qty: number, unit: PantryUnit) => void;
}

const UNITS: PantryUnit[] = ['pcs', 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup'];

export function EditPantryItemDialog({
  item,
  open,
  onOpenChange,
  onSave,
}: EditPantryItemDialogProps) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState<PantryUnit>('pcs');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQty(String(item.qty || 1));
      setUnit(item.unit || 'pcs');
    }
  }, [item]);

  const handleSave = () => {
    if (item && name.trim()) {
      const quantity = parseFloat(qty) || 1;
      onSave(item.id, name.trim(), quantity, unit);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit ingredient</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ingredient name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ingredient name"
              className="h-12 text-base rounded-xl"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Quantity"
                className="h-12 text-base rounded-xl"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={(value) => setUnit(value as PantryUnit)}>
                <SelectTrigger id="unit" className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-full text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 h-12 rounded-full text-base font-semibold"
            >
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
