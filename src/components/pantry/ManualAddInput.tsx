import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PantryUnit } from '@/types';

interface ManualAddInputProps {
  onAdd: (name: string, qty: number, unit: PantryUnit) => void;
  initialExpanded?: boolean;
}

const UNITS: PantryUnit[] = ['pcs', 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup'];

export const ManualAddInput = ({ onAdd, initialExpanded = false }: ManualAddInputProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState<PantryUnit>('pcs');

  const handleAdd = () => {
    if (name.trim()) {
      const quantity = parseFloat(qty) || 1;
      onAdd(name.trim(), quantity, unit);
      setName('');
      setQty('1');
      setUnit('pcs');
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setQty('1');
    setUnit('pcs');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="outline"
        className="w-full h-12 rounded-full text-sm sm:text-base font-semibold gap-2"
      >
        <Plus className="h-5 w-5" />
        Add manually
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-2xl bg-card animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Add ingredient</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ingredient name"
        className="h-11 text-base rounded-lg"
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Quantity"
          className="h-11 text-base rounded-lg"
          min="0"
          step="0.1"
        />
        
        <Select value={unit} onValueChange={(value) => setUnit(value as PantryUnit)}>
          <SelectTrigger className="h-11 rounded-lg">
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

      <Button
        onClick={handleAdd}
        disabled={!name.trim()}
        className="w-full h-11 rounded-full text-base font-semibold"
      >
        Add to pantry
      </Button>
    </div>
  );
};
