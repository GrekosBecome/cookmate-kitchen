import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { InstallSection } from '@/components/landing/InstallSection';

const Landing = () => {

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
