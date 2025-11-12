import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChefHat, Apple, Mail, X, User } from 'lucide-react';

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

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      toast({
        title: "Apple Sign In failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
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

                {/* Apple Option */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-base font-medium justify-start gap-4"
                  onClick={handleAppleSignIn}
                  disabled={loading}
                >
                  <Apple className="h-5 w-5" />
                  Continue with Apple
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
