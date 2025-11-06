import { Button } from '@/components/ui/button';
import { MessageSquare, Camera, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    icon: MessageSquare,
    title: 'Chef Chat',
    description: 'Talk to your personal chef anytime',
    details: [
      'Get instant cooking tips and advice',
      'Recipe substitutions on demand',
      'Personalized modifications',
      'Available 24/7',
    ],
  },
  {
    icon: Camera,
    title: 'Smart Pantry',
    description: 'Automatic ingredient detection',
    details: [
      'Scan with your camera',
      'Smart recognition',
      'Automatic inventory tracking',
      'Expiration reminders',
    ],
  },
  {
    icon: Sparkles,
    title: 'Personalized Recipes',
    description: 'Tailored to your needs',
    details: [
      'Based on your pantry',
      'Dietary preferences respected',
      'Cooking history analysis',
      'Skill level adaptation',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Cooking Insights',
    description: 'Track your culinary journey',
    details: [
      'Favorite cuisines analysis',
      'Most-used ingredients',
      'Cooking patterns',
      'Progress tracking',
    ],
  },
];

export const ServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="services" className="py-20 md:py-32 border-t">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-20 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything you need to
            <span className="block text-primary">cook smarter</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From ingredients to masterpiece, Kitchen Mate guides you every step of the way.
          </p>
        </div>

        {/* Services Grid - Alternating Layout */}
        <div className="space-y-24">
          {services.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={service.title}
                className={`grid md:grid-cols-2 gap-12 items-center animate-fade-in ${
                  isEven ? '' : 'md:flex-row-reverse'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Text Column */}
                <div className={`space-y-6 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">{service.title}</h3>
                    <p className="text-lg text-muted-foreground">{service.description}</p>
                    <ul className="space-y-2">
                      {service.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => navigate('/onboarding')}
                    className="mt-4"
                  >
                    Try It Now
                  </Button>
                </div>

                {/* Visual Column */}
                <div className={`${isEven ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="relative aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl" />
                    <div className="relative h-full flex items-center justify-center p-8">
                      <service.icon className="w-32 h-32 text-primary opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
