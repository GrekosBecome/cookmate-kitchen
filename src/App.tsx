import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useStore } from "@/store/useStore";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { TrialEndingBanner } from "@/components/subscription/TrialEndingBanner";
import { useSubscription } from "@/hooks/useSubscription";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
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

  // Hide bottom nav on onboarding, index, landing, offline, privacy, features, support, and chat pages
  const hideBottomNav = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/landing' || location.pathname === '/offline' || location.pathname === '/privacy' || location.pathname === '/features' || location.pathname === '/support' || location.pathname === '/chat';

  return (
    <>
      {/* Trial Ending Banner - Shows on all pages except onboarding, landing, offline */}
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
        <Route path="/landing" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/suggestion" element={<Suggestion />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/insights" element={<Insights />} />
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
