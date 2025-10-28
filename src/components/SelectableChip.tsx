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
        'rounded-full border-2 font-medium transition-all duration-300 active:scale-95',
        variant === 'default' ? 'px-6 py-3 text-base' : 'px-5 py-2.5 text-base',
        selected
          ? 'bg-chip-selected text-chip-text-selected border-chip-selected shadow-md'
          : 'bg-background text-foreground border-border hover:border-chip-selected/40'
      )}
    >
      {label}
    </button>
  );
};
