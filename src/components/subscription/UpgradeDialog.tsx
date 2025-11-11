import { useNavigate } from 'react-router-dom';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';
import { useRevenueCatPaywall } from '@/hooks/useRevenueCatPaywall';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, ChefHat, MessageCircle, Zap, Check, Crown, Loader2 } from 'lucide-react';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeDialog = ({ open, onOpenChange }: UpgradeDialogProps) => {
  const navigate = useNavigate();
  const { isNative } = useInAppPurchases();
  const { presentPaywall, loading: paywallLoading } = useRevenueCatPaywall();

  const features = [
    {
      icon: Camera,
      title: '100 Image Analyses',
      description: 'Scan your pantry with ease',
      free: '10/month',
      premium: '100/month',
    },
    {
      icon: ChefHat,
      title: '50 AI Recipe Generations',
      description: 'Get custom gourmet recipes',
      free: '0/month',
      premium: '50/month',
    },
    {
      icon: MessageCircle,
      title: '1000 Chat Messages',
      description: 'Chat with your cooking assistant',
      free: '50/month',
      premium: '1000/month',
    },
  ];

  const handleUpgrade = async () => {
    // Native app: Use RevenueCat native paywall
    if (isNative) {
      console.log('📱 Native app detected - showing RevenueCat paywall');
      const success = await presentPaywall();
      if (success) {
        onOpenChange(false);
      }
      return;
    }
    
    // Web: Navigate to settings for Stripe checkout
    console.log('🌐 Web app detected - navigating to settings');
    onOpenChange(false);
    navigate('/settings');
  };

  const isLoading = paywallLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock the full power of your AI cooking assistant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pricing */}
          <div className="text-center space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">€6.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              7-day free trial for new users
            </Badge>
          </div>

          <Separator />

          {/* Features Comparison */}
          <div className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{feature.title}</p>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground line-through">
                        Free: {feature.free}
                      </span>
                      <span className="text-primary font-medium">
                        Premium: {feature.premium}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Additional Benefits */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Also includes:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Priority customer support
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Early access to new features
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Ad-free experience
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {isNative ? 'View Premium Plans' : 'Start Free Trial'}
              </>
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full"
          >
            Maybe Later
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Cancel anytime. No commitments.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
