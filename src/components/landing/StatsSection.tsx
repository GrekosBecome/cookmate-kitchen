import { Users, ChefHat, Star, Globe } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Active Users',
  },
  {
    icon: ChefHat,
    value: '5,000+',
    label: 'Recipes',
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'User Rating',
  },
  {
    icon: Globe,
    value: '50+',
    label: 'Countries',
  },
];

export const StatsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-primary/5">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center space-y-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
