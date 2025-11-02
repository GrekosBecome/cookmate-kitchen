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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl floating" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }} />
      </div>

      <Header />
      <div className="relative z-10">
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <TestimonialsSection />
        <InstallSection />
      </div>
      
      {/* Footer */}
      <footer id="contact" className="border-t border-border relative z-10 py-12 frosted">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-extralight text-xl mb-3 gradient-text">CookMate</h3>
              <p className="text-sm text-muted-foreground font-light">
                Your Smart Kitchen Companion
              </p>
            </div>
            <div>
              <h3 className="font-extralight text-lg mb-3">Σύνδεσμοι</h3>
              <ul className="space-y-2 text-sm font-light">
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
              <h3 className="font-extralight text-lg mb-3">Επικοινωνία</h3>
              <p className="text-sm text-muted-foreground font-light">
                📧 hello@cookmate.app
              </p>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border font-light">
            <p>© 2025 CookMate. Your Smart Kitchen Companion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
