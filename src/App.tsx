import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { handleDeepLink } from "@/utils/deepLinkHandler";
import { useNativeBridge } from "@/hooks/useNativeBridge";
import { NativeBridgeStatus } from "@/components/NativeBridgeStatus";
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

const queryClient = new QueryClient();

function AppContent() {
  const applyConfidenceDecay = useStore((state) => state.applyConfidenceDecay);
  const location = useLocation();
  const navigate = useNavigate();
  const { isNative } = useNativeBridge();

  useEffect(() => {
    applyConfidenceDecay();
  }, [applyConfidenceDecay]);

  // Handle deep links in native mode
  useEffect(() => {
    if (isNative) {
      return handleDeepLink(navigate);
    }
  }, [isNative, navigate]);

  // Hide bottom nav on onboarding, index, landing and offline pages
  const hideBottomNav = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/landing' || location.pathname === '/offline';

  return (
    <>
      <NativeBridgeStatus />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/suggestion" element={<Suggestion />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/offline" element={<Offline />} />
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
