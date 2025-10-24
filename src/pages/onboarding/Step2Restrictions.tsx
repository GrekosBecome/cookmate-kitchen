import { useState } from 'react';
import { SelectableChip } from '@/components/SelectableChip';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface Step2RestrictionsProps {
  allergies: string[];
  dislikes: string[];
  onUpdateAllergies: (allergies: string[]) => void;
  onUpdateDislikes: (dislikes: string[]) => void;
}

const commonAllergies = [
  'Dairy',
  'Egg',
  'Gluten',
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Soy',
  'Sesame',
];

export const Step2Restrictions = ({
  allergies,
  dislikes,
  onUpdateAllergies,
  onUpdateDislikes,
}: Step2RestrictionsProps) => {
  const [dislikeInput, setDislikeInput] = useState('');

  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      onUpdateAllergies(allergies.filter((a) => a !== allergy));
    } else {
      onUpdateAllergies([...allergies, allergy]);
    }
  };

  const addDislike = () => {
    if (dislikeInput.trim() && !dislikes.includes(dislikeInput.trim())) {
      onUpdateDislikes([...dislikes, dislikeInput.trim()]);
      setDislikeInput('');
    }
  };

  const removeDislike = (dislike: string) => {
    onUpdateDislikes(dislikes.filter((d) => d !== dislike));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Any allergies or dislikes?</h1>
        <p className="text-muted-foreground text-lg">
          We'll make sure to avoid these ingredients
        </p>
      </div>

      {/* Allergies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Allergies</h2>
        <div className="flex flex-wrap gap-3">
          {commonAllergies.map((allergy) => (
            <SelectableChip
              key={allergy}
              label={allergy}
              selected={allergies.includes(allergy)}
              onToggle={() => toggleAllergy(allergy)}
              variant="small"
            />
          ))}
        </div>
      </div>

      {/* Dislikes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dislikes</h2>
        <div className="space-y-3">
          <Input
            placeholder="Type an ingredient you dislike..."
            value={dislikeInput}
            onChange={(e) => setDislikeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDislike()}
            className="h-12 text-base rounded-full"
          />
          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dislikes.map((dislike) => (
                <button
                  key={dislike}
                  onClick={() => removeDislike(dislike)}
                  className="px-4 py-2 bg-muted rounded-full text-sm font-medium flex items-center gap-2 hover:bg-muted/80 transition-colors"
                >
                  {dislike}
                  <X className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
