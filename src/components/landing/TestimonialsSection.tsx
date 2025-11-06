import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    avatar: '👩‍🍳',
    rating: 5,
    text: 'Kitchen Mate transformed how I cook. No more food waste!',
  },
  {
    name: 'James L.',
    avatar: '👨‍💼',
    rating: 5,
    text: 'The chef is like having a professional in my kitchen.',
  },
  {
    name: 'Maria K.',
    avatar: '👩‍💻',
    rating: 5,
    text: 'Finally, an app that understands my dietary restrictions.',
  },
  {
    name: 'David P.',
    avatar: '👨‍🎨',
    rating: 5,
    text: 'Scanning ingredients is so easy. My kids love it too!',
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="about" className="py-20 md:py-32 border-t">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold">
            Loved by home cooks
            <span className="block text-primary">everywhere</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who cook smarter with Kitchen Mate.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="hover-scale transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-muted-foreground">
                  "{testimonial.text}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Client Logos/Trust Section */}
        <div className="mt-16 pt-16 border-t">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Featured in
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50">
            <div className="text-xl font-bold">TechCrunch</div>
            <div className="text-xl font-bold">ProductHunt</div>
            <div className="text-xl font-bold">Wired</div>
            <div className="text-xl font-bold">The Verge</div>
          </div>
        </div>
      </div>
    </section>
  );
};
