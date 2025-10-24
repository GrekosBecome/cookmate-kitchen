import { SelectableChip } from '@/components/SelectableChip';
import { Preferences } from '@/types';

type DietType = Preferences['diet'];

interface Step1DietProps {
  selectedDiet: DietType;
  onSelectDiet: (diet: DietType) => void;
}

const dietOptions: DietType[] = [
  'Regular',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Gluten-free',
];

export const Step1Diet = ({ selectedDiet, onSelectDiet }: Step1DietProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">What's your diet?</h1>
        <p className="text-muted-foreground text-lg">
          We'll suggest recipes that match your preferences
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        {dietOptions.map((diet) => (
          <SelectableChip
            key={diet}
            label={diet}
            selected={selectedDiet === diet}
            onToggle={() => onSelectDiet(diet)}
          />
        ))}
      </div>
    </div>
  );
};
