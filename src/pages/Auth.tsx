import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { SignInWithApple, SignInWithAppleResponse, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');

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

  const emailSchema = z.string().trim().email({ message: "Invalid email address" });

  const handleContinueWithEmail = () => {
    try {
      emailSchema.parse(email);
      setShowPasswordDialog(true);
      setIsForgotPassword(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid email",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
    }
  };

  const handleSignInClick = () => {
    setShowSignInDialog(true);
    setShowPasswordField(false);
    setPassword('');
  };

  const handleSignInEmailContinue = () => {
    try {
      emailSchema.parse(signInEmail);
      setShowPasswordField(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid email",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
    }
  };

  const handleForgotPassword = async () => {
    try {
      emailSchema.parse(signInEmail);
      
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(signInEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
      
      setShowSignInDialog(false);
      setShowPasswordField(false);
      setIsForgotPassword(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid email",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Try to sign in with the sign in email
      const emailToUse = showSignInDialog ? signInEmail : email;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (signInError) {
        // If sign in fails, try to sign up
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
            }
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            toast({
              title: "Account created!",
              description: "Welcome to CookMate",
            });
            navigate('/onboarding', { replace: true });
          }
        } else {
          throw signInError;
        }
      } else if (signInData.user) {
        toast({
          title: "Welcome back!",
          description: "You're now logged in",
        });
        const from = (location.state as any)?.from?.pathname || '/suggestion';
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication failed",
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
    <>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center">
              <svg className="w-10 h-10 text-background" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c-.8 0-1.5.4-1.9 1.1-.5.7-.6 1.5-.4 2.3L12 14l2.3-8.6c.2-.8.1-1.6-.4-2.3C13.5 2.4 12.8 2 12 2z"/>
                <path d="M17.5 8c-1.2 0-2.3.6-3 1.5l-2 2.5-2-2.5C9.8 8.6 8.7 8 7.5 8c-2.5 0-4.5 2-4.5 4.5S5 17 7.5 17c1.2 0 2.3-.6 3-1.5l2-2.5 2 2.5c.7.9 1.8 1.5 3 1.5 2.5 0 4.5-2 4.5-4.5S20 8 17.5 8zm-10 7c-1.4 0-2.5-1.1-2.5-2.5S6.1 10 7.5 10s2.5 1.1 2.5 2.5S8.9 15 7.5 15zm10 0c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center text-foreground mb-8">
            Get started with your email
          </h1>

          {/* Email Input */}
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-muted/30 border-border text-base placeholder:text-muted-foreground/60 rounded-xl"
            />

            <Button
              onClick={handleContinueWithEmail}
              disabled={loading}
              variant="outline"
              className="w-full h-14 text-base bg-muted/20 border-border hover:bg-muted/40 rounded-xl font-medium"
            >
              Continue
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full h-14 text-base bg-muted/20 border-border hover:bg-muted/40 rounded-xl font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </Button>

            <Button
              type="button"
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;
              }}
              disabled={loading}
              variant="outline"
              className="w-full h-14 text-base bg-muted/20 border-border hover:bg-muted/40 rounded-xl font-medium"
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

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground pt-4">
            Already have an account?{' '}
            <button 
              onClick={handleSignInClick}
              className="text-foreground underline hover:text-foreground/80 font-medium"
            >
              Sign in
            </button>
          </p>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground/70 px-8 pt-4">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Use
            </a>
            {' '}and acknowledge that you have read our{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Sign In Dialog */}
      <Dialog open={showSignInDialog} onOpenChange={(open) => {
        setShowSignInDialog(open);
        if (!open) {
          setShowPasswordField(false);
          setPassword('');
          setSignInEmail('');
          setIsForgotPassword(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isForgotPassword ? 'Reset your password' : 'Sign in'}
            </DialogTitle>
            <DialogDescription>
              {isForgotPassword 
                ? `We'll send a reset link to your email`
                : 'Enter your email to continue'
              }
            </DialogDescription>
          </DialogHeader>
          
          {isForgotPassword ? (
            <div className="space-y-4 mt-4">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="h-12 text-base"
              />
              <Button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full h-12 text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsForgotPassword(false)}
                className="w-full"
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="h-12 text-base"
                  disabled={showPasswordField}
                />
                
                {!showPasswordField ? (
                  <Button
                    type="button"
                    onClick={handleSignInEmailContinue}
                    disabled={loading}
                    className="w-full h-12 text-base"
                  >
                    Continue
                  </Button>
                ) : (
                  <>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                      className="h-12 text-base"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 text-base"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center"
                    >
                      Forgot password?
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Dialog for Sign Up */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) {
          setPassword('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Enter your password</DialogTitle>
            <DialogDescription>
              for {email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="h-12 text-base"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;
