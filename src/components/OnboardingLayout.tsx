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
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl floating" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="p-4 pt-6 flex items-center justify-between relative z-10 frosted">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-glass-bg transition-all min-h-[44px] min-w-[44px]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <ProgressDots total={totalSteps} current={currentStep} />
        <button
          onClick={onSkip}
          className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors px-3 py-2 min-h-[44px]"
        >
          {skipLabel}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-auto relative z-10">
        {children}
      </div>

      {/* Footer */}
      <div className="p-6 pt-4 frosted backdrop-blur-xl relative z-10">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full h-14 text-lg font-light rounded-full min-h-[44px] glass-button border-primary/30"
          size="lg"
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};
