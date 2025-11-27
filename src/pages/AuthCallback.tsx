import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Close the in-app browser if it's open (native platforms)
        if (Capacitor.isNativePlatform()) {
          const { Browser } = await import('@capacitor/browser');
          await Browser.close();
        }

        // Get the session from URL hash params (OAuth callback)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth', { replace: true });
          return;
        }

        if (data?.session) {
          console.log('✅ Auth callback: Session found, redirecting to onboarding');
          navigate('/onboarding', { replace: true });
        } else {
          console.log('⚠️ Auth callback: No session found');
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
