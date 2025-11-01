import { MealPreferenceCard } from '@/components/MealPreferenceCard';
import { Beef, Carrot, Users, Apple, Clock, Fish } from 'lucide-react';

interface Step1DietProps {
  selectedPreferences: string[];
  onTogglePreference: (preference: string) => void;
}

const mealOptions = [
  { id: 'meat-veggies', label: 'Meat & Veggies', icon: Beef },
  { id: 'veggie', label: 'Veggie', icon: Carrot },
  { id: 'family-friendly', label: 'Family Friendly', icon: Users },
  { id: 'fit-wholesome', label: 'Fit & Wholesome', icon: Apple },
  { id: 'under-20-min', label: 'Under 20 Minutes', icon: Clock },
  { id: 'pescatarian', label: 'Pescatarian', icon: Fish },
];

export const Step1Diet = ({ selectedPreferences, onTogglePreference }: Step1DietProps) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-extralight tracking-wide gradient-text">
          What kind of meals do you like?
        </h1>
        <p className="text-muted-foreground text-lg font-light">
          We'll recommend meals you're more likely to enjoy
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6">
        {mealOptions.map((option) => (
          <MealPreferenceCard
            key={option.id}
            icon={option.icon}
            label={option.label}
            selected={selectedPreferences.includes(option.id)}
            onToggle={() => onTogglePreference(option.id)}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center pt-4 font-light">
        We'll show you your preferred recipes first, but you'll have access to the full menu every week.
      </p>
    </div>
  );
};
