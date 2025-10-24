import { ReactNode } from 'react';
import { ProgressDots } from './ProgressDots';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext: () => void;
  onSkip: () => void;
  nextLabel?: string;
  skipLabel?: string;
  canProceed?: boolean;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Continue',
  skipLabel = 'Skip',
  canProceed = true,
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <ProgressDots total={totalSteps} current={currentStep} />
        <button
          onClick={onSkip}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
        >
          {skipLabel}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-auto">
        {children}
      </div>

      {/* Footer */}
      <div className="p-6 pt-4 border-t bg-card">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full h-14 text-lg font-semibold rounded-full"
          size="lg"
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};
