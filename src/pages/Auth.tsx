import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
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

// Password validation schema
const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

// Password requirements component
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  return (
    <div className="space-y-1.5 mt-2">
      {requirements.map((req, idx) => (
        <p key={idx} className={`text-xs flex items-center gap-1.5 ${req.met ? "text-green-500" : "text-muted-foreground"}`}>
          <span>{req.met ? "✓" : "○"}</span>
          {req.label}
        </p>
      ))}
    </div>
  );
};

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
        clientId: 'com.cookmate.kitchen',
        redirectURI: 'https://gsozaqboqcjbthbighqg.supabase.co/auth/v1/callback',
        scopes: 'email name',
        state: state,
        nonce: rawNonce,
      };

      console.log('Starting Apple Sign-In with options:', { clientId: options.clientId, scopes: options.scopes });
      const result: SignInWithAppleResponse = await SignInWithApple.authorize(options);
      console.log('Apple Sign-In successful, got identity token');

      // Extract full name if provided (only available on first sign-in)
      const fullName = result.response.givenName || result.response.familyName 
        ? `${result.response.givenName || ''} ${result.response.familyName || ''}`.trim()
        : undefined;

      // Call our custom edge function to handle Apple auth
      console.log('Calling apple-auth edge function...');
      const { data: authData, error: functionError } = await supabase.functions.invoke('apple-auth', {
        body: { 
          idToken: result.response.identityToken, 
          nonce: rawNonce,
          fullName 
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }

      if (!authData?.success) {
        console.error('Auth failed:', authData);
        throw new Error(authData?.error || 'Authentication failed');
      }

      console.log('Edge function response:', authData);

      // Use the magic link to complete authentication
      if (authData.verification?.action_link) {
        // Extract token from the action link and verify
        const actionUrl = new URL(authData.verification.action_link);
        const token = actionUrl.searchParams.get('token');
        const type = actionUrl.searchParams.get('type') as 'magiclink';
        
        if (token) {
          console.log('Verifying OTP token...');
          const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type || 'magiclink',
          });

          if (verifyError) {
            console.error('OTP verification error:', verifyError);
            throw verifyError;
          }

          if (verifyData.user) {
            console.log('User authenticated successfully:', verifyData.user.id);
            toast({
              title: "Welcome!",
              description: "You're now logged in with Apple",
            });
            navigate('/onboarding', { replace: true });
            return;
          }
        }
      }

      // Fallback: If we got user data but couldn't create session, show success anyway
      // The user record was created, they can sign in with email
      if (authData.user) {
        toast({
          title: "Account created!",
          description: "Please check your email to complete sign in",
        });
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

    const emailToUse = showSignInDialog ? signInEmail : email;
    const isSignUp = !showSignInDialog; // Sign up is from main flow, sign in is from dialog

    // For sign up, validate password strength first
    if (isSignUp) {
      try {
        passwordSchema.parse(password);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Password too weak",
            description: error.errors[0].message,
            variant: "destructive"
          });
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (signInError) {
        // If sign in fails and we're in sign up flow, try to sign up
        if (signInError.message.includes('Invalid login credentials') && isSignUp) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: emailToUse,
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
      
      // Better error messages
      let errorMessage = error.message || "Please try again";
      
      if (error.message?.includes('weak_password') || error.message?.includes('weak and easy to guess')) {
        errorMessage = "This password has been found in data breaches. Please choose a stronger, unique password.";
      } else if (error.message?.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Try signing in instead.";
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Incorrect email or password. Please try again.";
      }
      
      toast({
        title: "Authentication failed",
        description: errorMessage,
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-foreground flex items-center justify-center">
              <svg className="w-12 h-12 text-background" viewBox="0 0 64 64" fill="currentColor">
                {/* Chef Hat */}
                <path d="M32 8C28 8 24.5 10 22 13c-2-1-4.5-1.5-7-1.5-6.5 0-12 5.5-12 12 0 4 2 7.5 5 9.5V52c0 2 1.5 4 4 4h40c2.5 0 4-2 4-4V33c3-2 5-5.5 5-9.5 0-6.5-5.5-12-12-12-2.5 0-5 .5-7 1.5C39.5 10 36 8 32 8zm0 4c3 0 5.5 1.5 7 4 0 0 .5 1 1.5 1s1.5-1 1.5-1c1.5-1.5 3.5-2 5.5-2 4.5 0 8 3.5 8 8 0 3-1.5 5.5-4 7-1 .5-1.5 1.5-1.5 2.5V52H14V32.5c0-1-.5-2-1.5-2.5-2.5-1.5-4-4-4-7 0-4.5 3.5-8 8-8 2 0 4 .5 5.5 2 0 0 .5 1 1.5 1s1.5-1 1.5-1c1.5-2.5 4-4 7-4z"/>
                {/* Hat pleats */}
                <ellipse cx="32" cy="22" rx="14" ry="4" opacity="0.2"/>
                <path d="M46 22c0 2.2-6.3 4-14 4s-14-1.8-14-4c0-2.2 6.3-4 14-4s14 1.8 14 4z" opacity="0.3"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-semibold text-center text-foreground mb-6 sm:mb-8 px-2">
            Get started with your email
          </h1>

          {/* Email Input */}
          <div className="space-y-3 sm:space-y-4">
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 sm:h-14 bg-muted/30 border-border text-sm sm:text-base placeholder:text-muted-foreground/60 rounded-xl"
            />

            <Button
              onClick={handleContinueWithEmail}
              disabled={loading}
              variant="outline"
              className="w-full h-12 sm:h-14 text-sm sm:text-base bg-muted/20 border-border hover:bg-muted/40 rounded-xl font-medium"
            >
              Continue
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-2.5 sm:space-y-3">
            <Button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full h-12 sm:h-14 text-sm sm:text-base bg-muted/20 border-border hover:bg-muted/40 rounded-xl font-medium"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </Button>

            <Button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  if (Capacitor.isNativePlatform()) {
                    // Use in-app browser (Safari View Controller) for native
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        skipBrowserRedirect: true,
                        redirectTo: `${window.location.origin}/auth/callback`
                      }
                    });
                    
                    if (error) throw error;
                    
                    if (data?.url) {
                      // Dynamic import to avoid build error
                      const { Browser } = await import('@capacitor/browser');
                      await Browser.open({ 
                        url: data.url,
                        presentationStyle: 'popover'
                      });
                    }
                  } else {
                    // Web: normal OAuth flow
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`
                      }
                    });
                  }
                } catch (error: any) {
                  console.error('Google Sign In error:', error);
                  toast({
                    title: "Google Sign In failed",
                    description: error.message || "Please try again",
                    variant: "destructive"
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              variant="outline"
              className="w-full h-12 sm:h-14 text-sm sm:text-base bg-muted/20 border-border hover:bg-muted/40 rounded-xl font-medium"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Sign in link */}
          <p className="text-center text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4">
            Already have an account?{' '}
            <button 
              onClick={handleSignInClick}
              className="text-foreground underline hover:text-foreground/80 font-medium"
            >
              Sign in
            </button>
          </p>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground/70 px-4 sm:px-8 pt-3 sm:pt-4">
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
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {isForgotPassword ? 'Reset your password' : 'Sign in'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isForgotPassword 
                ? `We'll send a reset link to your email`
                : 'Enter your email to continue'
              }
            </DialogDescription>
          </DialogHeader>
          
          {isForgotPassword ? (
            <div className="space-y-3 sm:space-y-4 mt-4">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="h-11 sm:h-12 text-sm sm:text-base"
              />
              <Button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-sm sm:text-base"
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4 mt-4">
              <div className="space-y-3 sm:space-y-4">
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                  disabled={showPasswordField}
                />
                
                {!showPasswordField ? (
                  <Button
                    type="button"
                    onClick={handleSignInEmailContinue}
                    disabled={loading}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base"
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
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 sm:h-12 text-sm sm:text-base"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline w-full text-center"
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
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Enter your password</DialogTitle>
            <DialogDescription className="text-sm">
              for {email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4 mt-4">
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="h-11 sm:h-12 text-sm sm:text-base"
              />
              <PasswordRequirements password={password} />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 text-sm sm:text-base"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
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
