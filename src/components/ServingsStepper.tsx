import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServingsStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const ServingsStepper = ({ value, onChange, min = 1, max = 10 }: ServingsStepperProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-12 w-12 rounded-full"
      >
        <Minus className="h-5 w-5" />
      </Button>
      <div className="min-w-16 text-center">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">servings</div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-12 w-12 rounded-full"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
};
