import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { InstallSection } from '@/components/landing/InstallSection';

const Landing = () => {
  const navigate = useNavigate();

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
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3">CookMate</h3>
              <p className="text-sm text-muted-foreground">
                Your Smart Kitchen Companion powered by AI
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Σύνδεσμοι</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/features')} className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/install')} className="text-muted-foreground hover:text-primary transition-colors">
                    Install App
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/privacy')} className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Επικοινωνία</h3>
              <p className="text-sm text-muted-foreground">
                📧 hello@cookmate.app
              </p>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>© 2025 CookMate. Your Smart Kitchen Companion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
