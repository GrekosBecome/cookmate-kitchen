import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap } from 'lucide-react';

interface UsageWarningProps {
  feature: 'image' | 'recipe' | 'chat';
  used: number;
  limit: number;
  onUpgrade: () => void;
}

export const UsageWarning = ({ feature, used, limit, onUpgrade }: UsageWarningProps) => {
  const percentage = (used / limit) * 100;
  const remaining = limit - used;

  // Only show warning when 80% or more is used
  if (percentage < 80) return null;

  const featureNames = {
    image: 'image analyses',
    recipe: 'AI recipes',
    chat: 'chat messages',
  };

  const isNearLimit = percentage >= 90;

  return (
    <Alert className={`${isNearLimit ? 'border-orange-500/50 bg-orange-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}>
      <AlertTriangle className={`h-4 w-4 ${isNearLimit ? 'text-orange-500' : 'text-yellow-500'}`} />
      <AlertDescription className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">
            {isNearLimit 
              ? `Almost out of ${featureNames[feature]}!`
              : `Running low on ${featureNames[feature]}`
            }
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Usage this month</span>
              <span>
                {used}/{limit} ({remaining} left)
              </span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </div>
        </div>

        <Button
          onClick={onUpgrade}
          size="sm"
          variant="default"
          className="h-8 w-full text-xs"
        >
          <Zap className="h-3 w-3 mr-1" />
          Upgrade for More
        </Button>
      </AlertDescription>
    </Alert>
  );
};
