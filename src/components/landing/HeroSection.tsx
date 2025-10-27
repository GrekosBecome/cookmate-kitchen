import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles } from 'lucide-react';
import { InstallButton } from './InstallButton';

export const HeroSection = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '5K+', label: 'Recipes' },
    { value: '99%', label: 'Satisfaction' },
  ];

  return (
    <section className="relative overflow-hidden pt-24 md:pt-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      <div className="container relative max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Your AI Kitchen
                <span className="block text-primary">Companion</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Never wonder "what's for dinner" again. Get personalized recipes based on what you have.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
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

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative aspect-square">
              {/* Main visual container */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[3rem] rotate-6" />
              <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 to-primary/5 rounded-[3rem] -rotate-6" />
              <div className="relative bg-background/50 backdrop-blur-sm rounded-[3rem] border-2 border-primary/20 shadow-2xl p-8 flex flex-col items-center justify-center">
                <ChefHat className="w-32 h-32 text-primary mb-4" />
                <p className="text-lg font-semibold">Smart Cooking Assistant</p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  AI-powered recipes tailored to your pantry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-16 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
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
      </div>
    </section>
  );
};
