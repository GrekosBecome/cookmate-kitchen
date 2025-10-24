import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export const ProgressDots = ({ total, current }: ProgressDotsProps) => {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === current
              ? 'w-8 bg-primary'
              : i < current
              ? 'w-2 bg-primary/50'
              : 'w-2 bg-muted'
          )}
        />
      ))}
    </div>
  );
};
