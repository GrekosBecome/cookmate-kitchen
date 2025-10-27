import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { InstallSection } from '@/components/landing/InstallSection';

const Landing = () => {
  const navigate = useNavigate();
  const { hasCompletedOnboarding, pantryItems } = useStore();

  useEffect(() => {
    // If user already has the app set up, redirect to app
    if (hasCompletedOnboarding && pantryItems.length > 0) {
      navigate('/suggestion', { replace: true });
    }
  }, [hasCompletedOnboarding, pantryItems.length, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InstallSection />
      
      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 CookMate. Your Smart Kitchen Companion.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
