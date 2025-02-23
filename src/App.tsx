
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import { VibeMatching } from "./features/vibe-matching";
import { Struggle } from "./features/struggle";
import { VoiceDouble } from "./features/voice-double";
import NotFound from "./pages/NotFound";
import { SessionProvider } from "./contexts/SessionContext";
import { SessionGuard } from "./components/session/SessionGuard";
import { ErrorBoundary } from "./components/error/ErrorBoundary";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route 
          path="/vibe-matching" 
          element={
            <SessionGuard>
              <VibeMatching />
            </SessionGuard>
          } 
        />
        <Route 
          path="/struggle" 
          element={
            <SessionGuard>
              <Struggle />
            </SessionGuard>
          } 
        />
        <Route 
          path="/voice-double" 
          element={
            <SessionGuard>
              <VoiceDouble />
            </SessionGuard>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SessionProvider>
            <Toaster />
            <AnimatedRoutes />
          </SessionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
