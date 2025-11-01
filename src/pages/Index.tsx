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
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl floating" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl floating" style={{ animationDelay: '1.5s' }} />
      </div>
      <div className="text-center space-y-4 relative z-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto pulse-glow" />
        <p className="text-muted-foreground font-light">Loading CookMate...</p>
      </div>
    </div>
  );
};

export default Index;
