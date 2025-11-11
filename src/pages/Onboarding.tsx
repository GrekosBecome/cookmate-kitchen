import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { Step0Goals } from './onboarding/Step0Goals';
import { Step1Diet } from './onboarding/Step1Diet';
import { Step2Restrictions } from './onboarding/Step2Restrictions';
import { Step3Notifications } from './onboarding/Step3Notifications';
import { useStore, defaultPreferences } from '@/store/useStore';
import { Preferences } from '@/types';
import { notificationService } from '@/lib/notifications';
import { toast } from 'sonner';

export default function Onboarding() {
  const navigate = useNavigate();
  const setPreferences = useStore((state) => state.setPreferences);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Preferences>(defaultPreferences);

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - Request permission BEFORE scheduling
      setPreferences(formData);
      
      // Only request permission if user selected notification days
      if (formData.notificationDays.length > 0) {
        try {
          // Request permission NOW (when button clicked)
          const granted = await notificationService.requestPermission();
          
          if (granted) {
            // Permission granted - schedule notifications
            await notificationService.scheduleNotifications({
              enabled: true,
              time: formData.notificationTime,
              days: formData.notificationDays
            });
            
            toast.success('Notifications enabled!', {
              description: 'You\'ll receive daily recipe suggestions'
            });
          } else {
            // Permission denied - show warning but continue
            toast.error('Notifications blocked', {
              description: 'You can enable them later in Settings'
            });
          }
        } catch (error) {
          console.error('Notification permission error:', error);
          toast.error('Failed to setup notifications');
        }
      }
      
      // Navigate to pantry regardless of permission status
      navigate('/pantry');
    }
  };

  const handleSkip = () => {
    setPreferences(defaultPreferences);
    navigate('/pantry');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<Preferences>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={4}
      onBack={currentStep > 0 ? handleBack : undefined}
      onNext={handleNext}
      onSkip={handleSkip}
      nextLabel={currentStep === 3 ? 'Set up pantry' : 'Continue'}
      skipLabel={currentStep === 3 ? 'Done' : 'Skip'}
    >
      {currentStep === 0 && (
        <Step0Goals
          selectedGoals={formData.goals}
          onToggleGoal={(goal: string) => {
            const isSelected = formData.goals.includes(goal);
            const newGoals = isSelected
              ? formData.goals.filter(g => g !== goal)
              : [...formData.goals, goal];
            updateFormData({ goals: newGoals });
          }}
        />
      )}
      {currentStep === 1 && (
        <Step1Diet
          selectedPreferences={formData.mealPreferences}
          onTogglePreference={(preference: string) => {
            const isSelected = formData.mealPreferences.includes(preference);
            const newPreferences = isSelected
              ? formData.mealPreferences.filter(p => p !== preference)
              : [...formData.mealPreferences, preference];
            updateFormData({ mealPreferences: newPreferences });
          }}
        />
      )}
      {currentStep === 2 && (
        <Step2Restrictions
          allergies={formData.allergies}
          dislikes={formData.dislikes}
          onUpdateAllergies={(allergies) => updateFormData({ allergies })}
          onUpdateDislikes={(dislikes) => updateFormData({ dislikes })}
        />
      )}
      {currentStep === 3 && (
        <Step3Notifications
          notificationTime={formData.notificationTime}
          notificationDays={formData.notificationDays}
          servings={formData.servings}
          onUpdateTime={(notificationTime) => updateFormData({ notificationTime })}
          onUpdateDays={(notificationDays) => updateFormData({ notificationDays })}
          onUpdateServings={(servings) => updateFormData({ servings })}
        />
      )}
    </OnboardingLayout>
  );
}
