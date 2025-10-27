import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-6">
            <WifiOff className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You're Offline</h1>
          <p className="text-muted-foreground">
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
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Available offline:</p>
            <ul className="text-left space-y-1 list-disc list-inside">
              <li>View your pantry items</li>
              <li>Browse saved recipes</li>
              <li>Access your shopping list</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offline;
