import { Target, Clock, Heart, Coins, Zap, Globe } from 'lucide-react';
import { MealPreferenceCard } from '@/components/MealPreferenceCard';
import { LucideIcon } from 'lucide-react';

interface Goal {
  id: string;
  label: string;
  icon: LucideIcon;
}

const GOALS: Goal[] = [
  { id: 'quick_meals', label: 'Quick Meals', icon: Clock },
  { id: 'healthy_eating', label: 'Healthy Eating', icon: Heart },
  { id: 'budget_friendly', label: 'Budget Friendly', icon: Coins },
  { id: 'meal_prep', label: 'Meal Prep', icon: Target },
  { id: 'new_cuisines', label: 'New Cuisines', icon: Globe },
  { id: 'energy_boost', label: 'Energy Boost', icon: Zap },
];

interface GoalsSectionProps {
  selectedGoals: string[];
  onToggleGoal: (goalId: string) => void;
}

export const GoalsSection = ({ selectedGoals, onToggleGoal }: GoalsSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {GOALS.map((goal) => (
        <MealPreferenceCard
          key={goal.id}
          icon={goal.icon}
          label={goal.label}
          selected={selectedGoals.includes(goal.id)}
          onToggle={() => onToggleGoal(goal.id)}
        />
      ))}
    </div>
  );
};
