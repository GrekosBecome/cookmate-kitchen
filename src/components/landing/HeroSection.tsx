import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles } from 'lucide-react';
import { InstallButton } from './InstallButton';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      <div className="container relative max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
          {/* Logo/Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-primary/10 p-6 rounded-3xl">
              <ChefHat className="w-16 h-16 text-primary" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your AI Kitchen
              <span className="block text-primary">Companion</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Never wonder "what's for dinner" again. Get personalized recipes based on what you have.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <InstallButton />
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Try Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Works offline
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              No App Store needed
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              iPhone & Android
            </div>
          </div>

          {/* Hero Image - Phone mockup placeholder */}
          <div className="relative w-full max-w-sm pt-12 animate-fade-in">
            <div className="relative aspect-[9/19] bg-gradient-to-br from-primary/20 to-primary/5 rounded-[3rem] border-8 border-foreground/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-background/50" />
              <div className="relative h-full p-6 flex flex-col items-center justify-center">
                <ChefHat className="w-20 h-20 text-primary mb-4" />
                <p className="text-sm font-medium">CookMate App Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
