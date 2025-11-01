import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
      </div>
      <div className="text-center space-y-6 max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="glass-card rounded-full p-8">
            <WifiOff className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extralight gradient-text">You're Offline</h1>
          <p className="text-muted-foreground font-light">
            It looks like you've lost your internet connection. Don't worry, some features are still available offline.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <div className="text-sm text-muted-foreground glass-card p-4 rounded-2xl">
            <p className="font-light mb-2">Available offline:</p>
            <ul className="text-left space-y-1 font-light">
              <li>• View your pantry items</li>
              <li>• Browse saved recipes</li>
              <li>• Access your shopping list</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offline;
