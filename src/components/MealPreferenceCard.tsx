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
        'relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl transition-all duration-500 active:scale-95 min-h-[140px]',
        selected
          ? 'glass-card border-primary/50 shadow-lg shadow-primary/20 pulse-glow'
          : 'glass-card border-border hover:border-primary/30'
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-7 h-7 holo-ring rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-primary" strokeWidth={3} />
        </div>
      )}
      
      <Icon className="h-12 w-12 text-foreground" strokeWidth={1.5} />
      
      <span className="font-light text-base text-center text-foreground">
        {label}
      </span>
    </button>
  );
};
