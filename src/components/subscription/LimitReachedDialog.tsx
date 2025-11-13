import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Camera, ChefHat, MessageCircle, Zap } from 'lucide-react';

interface LimitReachedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: 'image' | 'recipe' | 'chat';
  used: number;
  limit: number;
  onUpgrade: () => void;
}

export const LimitReachedDialog = ({
  open,
  onOpenChange,
  feature,
  used,
  limit,
  onUpgrade,
}: LimitReachedDialogProps) => {
  const featureConfig = {
    image: {
      icon: Camera,
      title: 'Image Analysis Limit Reached',
      description: "You've used all your image scans for this month.",
      color: 'text-primary',
    },
    recipe: {
      icon: ChefHat,
      title: 'Recipe Limit Reached',
      description: "You've used all your recipe generations for this month.",
      color: 'text-primary',
    },
    chat: {
      icon: MessageCircle,
      title: 'Chat Message Limit Reached',
      description: "You've used all your chat messages for this month.",
      color: 'text-primary',
    },
  };

  const config = featureConfig[feature];
  const Icon = config.icon;
  const percentage = (used / limit) * 100;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">
                {config.title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left space-y-4">
            <p>{config.description}</p>
            
            {/* Usage Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Usage this month</span>
                <span className="text-muted-foreground">
                  {used}/{limit}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            {/* Premium Benefits */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-primary" />
                <span>Premium Benefits</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 100 image analyses/month</li>
                <li>• 50 recipe generations/month</li>
                <li>• 1000 chat messages/month</li>
                <li>• Priority support</li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Upgrade to Premium for just €6.99/month and unlock unlimited creativity!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogAction
            onClick={onUpgrade}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="w-full bg-muted hover:bg-muted/80 text-foreground"
          >
            Maybe Later
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
