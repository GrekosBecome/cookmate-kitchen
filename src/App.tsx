import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabaseClient";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { TrialEndingBanner } from "@/components/subscription/TrialEndingBanner";
import { useSubscription } from "@/hooks/useSubscription";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Pantry from "./pages/Pantry";
import Suggestion from "./pages/Suggestion";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import RecipeDetail from "./pages/RecipeDetail";
import NotFound from "./pages/NotFound";
import Insights from "./pages/Insights";
import Offline from "./pages/Offline";
import Privacy from "./pages/Privacy";
import Features from "./pages/Features";
import Support from "./pages/Support";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function AppContent() {
  const applyConfidenceDecay = useStore((state) => state.applyConfidenceDecay);
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription, getDaysUntilTrialEnd } = useSubscription();

  const daysLeft = getDaysUntilTrialEnd();
  const showTrialBanner = subscription?.subscription_status === 'trial' && daysLeft !== null && daysLeft <= 3;

  useEffect(() => {
    applyConfidenceDecay();
  }, [applyConfidenceDecay]);

  // Auth state logging for debugging
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth State Change:', event);
      console.log('📱 Platform:', Capacitor.getPlatform());
      console.log('🎫 Has Session:', !!session);
      console.log('👤 User:', session?.user?.email);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
      }
      
      if (event === 'SIGNED_IN') {
        console.log('👋 User signed in');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle notification clicks
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: any;

    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notification) => {
        const route = notification.notification.extra?.route;
        if (route) {
          navigate(route);
        }
      }
    ).then(handle => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate]);

  // Hide bottom nav on onboarding, index, offline, privacy, features, support, auth, and chat pages
  const hideBottomNav = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/offline' || location.pathname === '/privacy' || location.pathname === '/features' || location.pathname === '/support' || location.pathname === '/auth' || location.pathname === '/chat';

  return (
    <>
      {/* Trial Ending Banner - Shows on all pages except onboarding, offline */}
      {showTrialBanner && !hideBottomNav && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <TrialEndingBanner 
            daysLeft={daysLeft!} 
            onUpgrade={() => navigate('/settings')} 
          />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
        <Route path="/suggestion" element={<ProtectedRoute><Suggestion /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/offline" element={<Offline />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/features" element={<Features />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideBottomNav && <BottomNav />}
      <InstallPrompt />
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        position="top-center"
        toastOptions={{
          style: {
            marginBottom: '80px', // Space for bottom nav
          },
        }}
      />
      <AppWrapper />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
