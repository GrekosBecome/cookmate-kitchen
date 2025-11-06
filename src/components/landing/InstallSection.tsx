import { Card } from '@/components/ui/card';
import { InstallButton } from './InstallButton';
import { Smartphone, Zap, Globe } from 'lucide-react';

export const InstallSection = () => {
  return (
    <section className="py-20 md:py-32 border-t">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          <div className="relative p-8 md:p-12 text-center space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to cook smarter?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Install Kitchen Mate now and start your culinary journey. Works perfectly on any device.
              </p>
            </div>

            <div className="flex justify-center animate-fade-in" style={{ animationDelay: '150ms' }}>
              <InstallButton />
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 pt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Native App Experience</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Lightning Fast</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Works Offline</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
