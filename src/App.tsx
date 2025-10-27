import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { BottomNav } from "@/components/BottomNav";
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

const queryClient = new QueryClient();

function AppContent() {
  const applyConfidenceDecay = useStore((state) => state.applyConfidenceDecay);
  const location = useLocation();

  useEffect(() => {
    applyConfidenceDecay();
  }, [applyConfidenceDecay]);

  // Hide bottom nav on onboarding and index pages
  const hideBottomNav = location.pathname === '/' || location.pathname === '/onboarding';

  return (
    <>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      {!hideBottomNav && <BottomNav />}
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
