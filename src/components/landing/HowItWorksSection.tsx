import { ArrowRight, Download, Camera, ChefHat } from 'lucide-react';

const steps = [
  {
    icon: Download,
    title: 'Install the App',
    description: 'Add CookMate to your home screen. No App Store, no hassle.',
  },
  {
    icon: Camera,
    title: 'Add Your Pantry',
    description: 'Scan ingredients or add them manually. CookMate remembers everything.',
  },
  {
    icon: ChefHat,
    title: 'Get Recipes & Cook',
    description: 'Receive personalized suggestions and start cooking with what you have.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center space-y-4 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-background border-2 border-primary/20 rounded-2xl flex items-center justify-center">
                <step.icon className="w-10 h-10 text-primary" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Arrow connector (hide on last item) */}
              {index < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-12 top-12 w-8 h-8 text-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
