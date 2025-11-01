import { cn } from '@/lib/utils';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  variant?: 'default' | 'small';
}

export const SelectableChip = ({ label, selected, onToggle, variant = 'default' }: SelectableChipProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'rounded-full font-light transition-all duration-500 active:scale-95',
        variant === 'default' ? 'px-6 py-3 text-base' : 'px-5 py-2.5 text-base',
        selected
          ? 'glass-card border-primary/50 shadow-lg shadow-primary/20 text-foreground'
          : 'glass-card border-border hover:border-primary/30 text-foreground/80'
      )}
    >
      {label}
    </button>
  );
};
