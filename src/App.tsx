
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SessionProvider } from "./contexts/SessionContext";
import { SessionGuard } from "./features/session/components/SessionGuard";
import { ErrorBoundary } from "./components/error/ErrorBoundary";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const VibeMatching = lazy(() => import("./features/vibe-matching").then(module => ({ default: module.VibeMatching })));
const Struggle = lazy(() => import("./features/struggle").then(module => ({ default: module.Struggle })));
const VoiceDouble = lazy(() => import("./features/voice-double").then(module => ({ default: module.VoiceDouble })));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="h-[100svh] w-full flex items-center justify-center bg-black">
    <div className="text-white font-mono animate-pulse">Loading...</div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
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
