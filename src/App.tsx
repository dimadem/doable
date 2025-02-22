
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
import { AuthGuard } from "./components/auth/AuthGuard";

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
            <AuthGuard>
              <VibeMatching />
            </AuthGuard>
          } 
        />
        <Route 
          path="/struggle" 
          element={
            <AuthGuard>
              <Struggle />
            </AuthGuard>
          } 
        />
        <Route 
          path="/voice-double" 
          element={
            <AuthGuard>
              <VoiceDouble />
            </AuthGuard>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
