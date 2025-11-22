import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Zap, Clock } from 'lucide-react';
import { useState } from 'react';

interface TrialEndingBannerProps {
  daysLeft: number;
  onUpgrade: () => void;
}

export const TrialEndingBanner = ({ daysLeft, onUpgrade }: TrialEndingBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || daysLeft > 3) return null;

  const urgencyColor = daysLeft <= 1 ? 'text-destructive' : 'text-orange-500';
  const bgColor = daysLeft <= 1 ? 'bg-destructive/10' : 'bg-orange-500/10';
  const borderColor = daysLeft <= 1 ? 'border-destructive/20' : 'border-orange-500/20';

  return (
    <Card className={`${bgColor} ${borderColor} border-2 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <div className="relative p-4">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Clock className={`h-5 w-5 ${urgencyColor}`} />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-sm">
                {daysLeft === 0 && 'Your trial ends today!'}
                {daysLeft === 1 && 'Your trial ends tomorrow'}
                {daysLeft > 1 && `${daysLeft} days left in your trial`}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Don't lose access to premium features. Upgrade now to continue enjoying unlimited recipes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={onUpgrade}
                size="sm"
                className="h-8 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Upgrade to Premium
              </Button>
              <span className="text-xs text-muted-foreground">
                Just €6.99/month
              </span>
            </div>
          </div>
        </div>

        {/* Animated border pulse */}
        {daysLeft <= 1 && (
          <div className="absolute inset-0 border-2 border-destructive/50 rounded-3xl animate-pulse pointer-events-none" />
        )}
      </div>
    </Card>
  );
};
