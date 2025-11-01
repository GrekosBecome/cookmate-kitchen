import { SelectableChip } from '@/components/SelectableChip';
interface Step0GoalsProps {
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
}
const goalOptions = ['Save money', 'Waste less food', 'Discover new recipes', 'Save time', 'Eat healthy'];
export const Step0Goals = ({
  selectedGoals,
  onToggleGoal
}: Step0GoalsProps) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-extralight tracking-wide gradient-text">
          What are your goals with CookMate?
        </h1>
        <p className="text-muted-foreground text-lg font-light">
          Let us know what's important to you
        </p>
      </div>

      <div className="space-y-4 pt-6">
        {goalOptions.map(goal => (
          <button
            key={goal}
            onClick={() => onToggleGoal(goal)}
            className={`
              w-full p-5 rounded-3xl text-left font-light text-lg
              transition-all duration-500 active:scale-98
              ${selectedGoals.includes(goal)
                ? 'glass-card border-primary/40 shadow-lg shadow-primary/20 pulse-glow'
                : 'glass-card border-border hover:border-primary/20 hover:shadow-lg'
              }
            `}
          >
            {goal}
          </button>
        ))}
      </div>
    </div>
  );
};