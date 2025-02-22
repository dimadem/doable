
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SessionState {
  sessionId: string | null;
  loading: boolean;
}

interface SessionContextType extends SessionState {
  startSession: () => Promise<void>;
  endSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const generateSessionId = () => crypto.randomUUID();

// Default personality for initial session
const DEFAULT_PERSONALITY = 'neutral';

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: true
  });

  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    setState(prev => ({ ...prev, sessionId: savedSessionId, loading: false }));
  }, []);

  const startSession = async () => {
    try {
      const sessionId = generateSessionId();
      localStorage.setItem('sessionId', sessionId);
      
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          id: sessionId, // Using the session ID as the primary key
          personality_key: DEFAULT_PERSONALITY, // Required field
          started_at: new Date().toISOString(),
          session_data: {}, // Initialize empty session data
          device_info: {} // Initialize empty device info
        });

      if (error) throw error;
      
      setState({ sessionId, loading: false });
      
      toast({
        title: "Session started",
        description: "Your journey has begun."
      });
    } catch (error) {
      console.error('Session start error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start session. Please try again."
      });
    }
  };

  const endSession = () => {
    localStorage.removeItem('sessionId');
    setState({ sessionId: null, loading: false });
  };

  return (
    <SessionContext.Provider value={{
      ...state,
      startSession,
      endSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
