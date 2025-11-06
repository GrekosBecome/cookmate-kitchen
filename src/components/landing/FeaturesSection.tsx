import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Camera, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Chef Chat',
    description: 'Talk to your personal chef. Get cooking tips, substitutions, and recipe modifications instantly.',
  },
  {
    icon: Camera,
    title: 'Smart Pantry',
    description: 'Scan ingredients with your camera. Kitchen Mate automatically detects and tracks what you have.',
  },
  {
    icon: Sparkles,
    title: 'Personalized Recipes',
    description: 'Get recipe suggestions based on your pantry, dietary preferences, and cooking history.',
  },
  {
    icon: TrendingUp,
    title: 'Cooking Insights',
    description: 'Track your culinary journey. See your favorite cuisines, most-used ingredients, and cooking patterns.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-32 border-t">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything you need to
            <span className="block text-primary">cook smarter</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From ingredients to masterpiece, Kitchen Mate guides you every step of the way.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="hover-scale hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
