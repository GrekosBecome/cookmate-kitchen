import { SelectableChip } from '@/components/SelectableChip';

interface Step0GoalsProps {
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
}

const goalOptions = [
  'Save money',
  'Waste less food',
  'Discover new recipes',
  'Save time',
  'Eat healthy',
];

export const Step0Goals = ({ selectedGoals, onToggleGoal }: Step0GoalsProps) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ποιοι είναι οι στόχοι σου;</h1>
        <p className="text-muted-foreground text-lg">
          Πες μας τι είναι σημαντικό για σένα.
        </p>
      </div>

      <div className="space-y-3 pt-4">
        {goalOptions.map((goal) => (
          <button
            key={goal}
            onClick={() => onToggleGoal(goal)}
            className={`w-full p-4 rounded-2xl text-left font-semibold text-base transition-all duration-300 active:scale-98 ${
              selectedGoals.includes(goal)
                ? 'bg-[hsl(88,60%,75%)] text-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {goal}
          </button>
        ))}
      </div>
    </div>
  );
};
