import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, Apple } from 'lucide-react';
import { SignInWithApple, SignInWithAppleResponse, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const from = (location.state as any)?.from?.pathname || '/suggestion';
        navigate(from, { replace: true });
      }
      setCheckingSession(false);
    });
  }, [navigate, location]);

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      // Check if running on iOS
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
        toast({
          title: "Not available",
          description: "Apple Sign-In is only available on iOS devices",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Generate secure random nonce and state
      const rawNonce = crypto.randomUUID();
      const state = crypto.randomUUID();
      
      const options: SignInWithAppleOptions = {
        clientId: 'com.cookmate.signin',
        redirectURI: 'https://gsozaqboqcjbthbighqg.supabase.co/auth/v1/callback',
        scopes: 'email name',
        state: state,
        nonce: rawNonce,
      };

      const result: SignInWithAppleResponse = await SignInWithApple.authorize(options);

      // Sign in to Supabase with Apple ID token using the SAME raw nonce
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.response.identityToken,
        nonce: rawNonce,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome!",
          description: "You're now logged in with Apple",
        });
        navigate('/onboarding', { replace: true });
      }
    } catch (error: any) {
      console.error('Apple Sign In error:', error);
      toast({
        title: "Apple Sign In failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && (!fullName || !username || !email || !password)) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'login' && (!email || !password)) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              username: username,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Account created!",
            description: "Welcome to CookMate",
          });
          navigate('/onboarding', { replace: true });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "You're now logged in",
          });
          const from = (location.state as any)?.from?.pathname || '/suggestion';
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: mode === 'signup' ? "Sign up failed" : "Sign in failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isIOS = Capacitor.getPlatform() === 'ios';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with back button */}
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-3xl font-light text-foreground mb-8">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-14 bg-muted/50 border-none text-base placeholder:text-muted-foreground/60"
                />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-14 bg-muted/50 border-none text-base placeholder:text-muted-foreground/60"
                />
              </>
            )}
            
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 bg-muted/50 border-none text-base placeholder:text-muted-foreground/60"
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 bg-muted/50 border-none text-base placeholder:text-muted-foreground/60"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-base bg-primary/90 hover:bg-primary"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-3">
            {isIOS && (
              <Button
                type="button"
                onClick={handleAppleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full h-14 text-base bg-card border-border hover:bg-muted/50"
              >
                <Apple className="w-5 h-5 mr-2" />
                Continue with Apple
              </Button>
            )}

            <Button
              type="button"
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;
              }}
              disabled={loading}
              variant="outline"
              className="w-full h-14 text-base bg-card border-border hover:bg-muted/50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="text-center pt-6">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setFullName('');
                setUsername('');
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground/70 px-8 pt-4">
            By continuing you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
