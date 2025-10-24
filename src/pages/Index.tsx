import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { hasCompletedOnboarding, pantryItems } = useStore();

  useEffect(() => {
    // Smart redirect logic
    if (!hasCompletedOnboarding) {
      navigate('/onboarding', { replace: true });
    } else if (pantryItems.length === 0) {
      navigate('/pantry', { replace: true });
    } else {
      navigate('/suggestion', { replace: true });
    }
  }, [hasCompletedOnboarding, pantryItems.length, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Loading CookMate...</p>
      </div>
    </div>
  );
};

export default Index;
