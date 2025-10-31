import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreferenceSummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onClick?: () => void;
}

export const PreferenceSummaryCard = ({ 
  icon: Icon, 
  label, 
  value,
  onClick 
}: PreferenceSummaryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 min-w-[100px] p-4 rounded-xl border-2 bg-card transition-all duration-200",
        onClick ? "hover:border-primary/40 active:scale-95 cursor-pointer" : "cursor-default"
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </div>
    </button>
  );
};
