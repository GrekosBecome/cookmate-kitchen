import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChefHat, Mail, X, User, Apple } from 'lucide-react';
import { SignInWithApple, SignInWithAppleResponse, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

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
        clientId: 'com.cookmate.kitchen.auth', // Service ID (not App ID!)
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
    
    if (!email || !password) {
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
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Account created!",
            description: "Welcome to Kitchen Mate",
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
        title: mode === 'signup' ? "Signup failed" : "Login failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 pb-32">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg">
          <ChefHat className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold mb-2 text-foreground">
          Your Kitchen Companion
        </h1>
        <p className="text-lg text-muted-foreground">
          Smart recipes, personalized for you
        </p>
      </div>

      {/* Bottom Sheet */}
      <Drawer open={true} dismissible={false}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <DrawerTitle className="text-2xl font-bold">
              {showEmailForm 
                ? (mode === 'login' ? 'Welcome back' : 'Create account')
                : 'How would you like to continue?'
              }
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-6 pb-8 space-y-3">
            {!showEmailForm ? (
              <>
                {/* Apple Sign-In Option (iOS only) */}
                {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios' && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 text-base font-medium justify-start gap-4 bg-black text-white hover:bg-black/90 hover:text-white border-black"
                    onClick={handleAppleSignIn}
                    disabled={loading}
                  >
                    <Apple className="h-5 w-5" />
                    Continue with Apple
                  </Button>
                )}

                {/* Google Option */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-base font-medium justify-start gap-4"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: `${window.location.origin}/onboarding`,
                        }
                      });
                      if (error) throw error;
                    } catch (error: any) {
                      toast({
                        title: "Google Sign In failed",
                        description: error.message,
                        variant: "destructive"
                      });
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                {/* Email Option */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-base font-medium justify-start gap-4"
                  onClick={() => setShowEmailForm(true)}
                >
                  <Mail className="h-5 w-5" />
                  Continue with Email
                </Button>
              </>
            ) : (
              <>
                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="chef@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      minLength={6}
                      className="h-12 text-base"
                    />
                    {mode === 'signup' && (
                      <p className="text-xs text-muted-foreground">
                        At least 6 characters
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full h-14 text-base font-medium" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {mode === 'login' ? 'Login' : 'Create Account'}
                  </Button>
                </form>

                {/* Toggle between login/signup */}
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setEmail('');
                      setPassword('');
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mode === 'login' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Login"
                    }
                  </button>
                </div>

                {/* Back button */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmail('');
                    setPassword('');
                  }}
                  className="w-full"
                >
                  Back
                </Button>
              </>
            )}

            <p className="text-xs text-center text-muted-foreground pt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Auth;
