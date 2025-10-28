import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MealPreferenceCardProps {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export const MealPreferenceCard = ({ 
  icon: Icon, 
  label, 
  selected, 
  onToggle 
}: MealPreferenceCardProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 active:scale-95 min-h-[140px]',
        selected
          ? 'bg-[hsl(88,60%,75%)] border-[hsl(88,60%,75%)] text-foreground'
          : 'bg-muted border-muted text-foreground hover:border-[hsl(88,60%,85%)]'
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-background" strokeWidth={3} />
        </div>
      )}
      
      <Icon className="h-10 w-10" strokeWidth={1.5} />
      
      <span className="font-semibold text-base text-center">
        {label}
      </span>
    </button>
  );
};
