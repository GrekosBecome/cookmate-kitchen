import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallButton = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no install prompt available, just redirect to onboarding
      toast.info('Add to Home Screen', {
        description: 'Tap the share button and select "Add to Home Screen"',
      });
      navigate('/onboarding');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
      setIsInstalled(true);
      navigate('/onboarding');
    }

    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <Button
        size="lg"
        onClick={() => navigate('/onboarding')}
        className="gap-2"
      >
        <Check className="w-5 h-5" />
        Open App
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      onClick={handleInstall}
      className="gap-2 text-lg px-8"
    >
      <Download className="w-5 h-5" />
      Install CookMate
    </Button>
  );
};
