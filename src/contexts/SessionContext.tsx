
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { SessionSelection } from '@/features/vibe-matching/types';

interface SessionState {
  sessionId: string | null;
  loading: boolean;
  personalityKey?: string;
  sessionData?: {
    selections: SessionSelection[];
    finalPersonality: string;
  };
}

interface SessionContextType extends SessionState {
  startSession: () => Promise<void>;
  endSession: () => void;
  setPersonalityData: (personalityKey: string, selections: SessionSelection[]) => void;
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
    const savedPersonalityData = localStorage.getItem('personalityData');
    
    setState(prev => ({
      ...prev,
      sessionId: savedSessionId,
      ...(savedPersonalityData ? JSON.parse(savedPersonalityData) : {}),
      loading: false
    }));
  }, []);

  const startSession = async () => {
    try {
      const sessionId = generateSessionId();
      localStorage.setItem('sessionId', sessionId);
      
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          id: sessionId,
          personality_key: DEFAULT_PERSONALITY,
          started_at: new Date().toISOString(),
          session_data: {},
          device_info: {}
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

  const setPersonalityData = (personalityKey: string, selections: SessionSelection[]) => {
    const personalityData = {
      personalityKey,
      sessionData: {
        selections,
        finalPersonality: personalityKey
      }
    };
    
    localStorage.setItem('personalityData', JSON.stringify(personalityData));
    setState(prev => ({ ...prev, ...personalityData }));
  };

  const endSession = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('personalityData');
    setState({ sessionId: null, loading: false });
  };

  return (
    <SessionContext.Provider value={{
      ...state,
      startSession,
      endSession,
      setPersonalityData
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
