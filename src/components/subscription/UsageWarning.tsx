import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap, X } from 'lucide-react';

interface UsageWarningProps {
  feature: 'image' | 'recipe' | 'chat';
  used: number;
  limit: number;
  onUpgrade: () => void;
}

export const UsageWarning = ({ feature, used, limit, onUpgrade }: UsageWarningProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const percentage = (used / limit) * 100;
  const remaining = limit - used;

  // Only show warning when 80% or more is used
  if (percentage < 80 || isDismissed) return null;

  const featureNames = {
    image: 'image analyses',
    recipe: 'recipes',
    chat: 'chat messages',
  };

  const isNearLimit = percentage >= 90;

  return (
    <Card className="relative p-8 text-center space-y-6 bg-gradient-to-b from-background to-muted/20">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-background/80"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Large centered icon */}
      <div className="flex justify-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          isNearLimit ? 'bg-orange-500/10 text-orange-500' : 'bg-yellow-500/10 text-yellow-500'
        }`}>
          <AlertTriangle className="h-10 w-10" />
        </div>
      </div>

      {/* Main message */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {isNearLimit 
            ? `Almost out of ${featureNames[feature]}!`
            : `Running low on ${featureNames[feature]}`
          }
        </h3>
        <p className="text-sm text-muted-foreground">
          {used}/{limit} used ({remaining} remaining this month)
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={percentage} className="h-2" />
      </div>

      {/* Upgrade button */}
      <Button
        onClick={onUpgrade}
        size="lg"
        className="w-full rounded-full font-medium"
      >
        <Zap className="h-4 w-4 mr-2" />
        Upgrade for More
      </Button>
    </Card>
  );
};
