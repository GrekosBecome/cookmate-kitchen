import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
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
      <Header />
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <TestimonialsSection />
      <InstallSection />
      
      {/* Footer */}
      <footer id="contact" className="border-t py-12">
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
