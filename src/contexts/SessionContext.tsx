
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { SessionSelection } from '@/features/vibe-matching/types';
import { isSessionExpired, getSessionData, clearSessionData } from '@/utils/sessionUtils';
import { SessionState, SessionContextType } from './types/session.types';
import { initializeSession, validateSessionInDb, updatePersonalityData } from './services/sessionService';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const generateSessionId = () => crypto.randomUUID();

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: true,
    error: null
  });

  const validateSession = async () => {
    try {
      if (!state.sessionId) return false;

      const startedAt = await validateSessionInDb(state.sessionId);
      if (!startedAt) return false;

      if (isSessionExpired(startedAt)) {
        endSession();
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please start a new session.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      endSession();
      return false;
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { sessionId, personalityData } = getSessionData();
        
        if (sessionId) {
          const isValid = await validateSession();
          if (!isValid) {
            clearSessionData();
            setState({ sessionId: null, loading: false, error: null });
            return;
          }
        }

        setState(prev => ({
          ...prev,
          sessionId,
          ...(personalityData ? JSON.parse(personalityData) : {}),
          loading: false,
          error: null
        }));
      } catch (error) {
        console.error('Session initialization error:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error : new Error('Session initialization failed') 
        }));
      }
    };

    initSession();
  }, []);

  const startSession = async () => {
    try {
      const sessionId = generateSessionId();
      await initializeSession(sessionId);
      
      localStorage.setItem('sessionId', sessionId);
      setState(prev => ({ ...prev, sessionId, error: null }));
      
      toast({
        title: "Session started",
        description: "Your journey has begun."
      });

      return true;
    } catch (error) {
      console.error('Session start error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('Failed to start session') 
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start session. Please try again."
      });
      return false;
    }
  };

  const setPersonalityData = async (personalityKey: string, selections: SessionSelection[]) => {
    try {
      const personalityData = {
        personalityKey,
        sessionData: {
          selections,
          finalPersonality: personalityKey
        }
      };
      
      if (state.sessionId) {
        await updatePersonalityData(state.sessionId, personalityKey, selections);
      }
      
      localStorage.setItem('personalityData', JSON.stringify(personalityData));
      setState(prev => ({ ...prev, ...personalityData, error: null }));
    } catch (error) {
      console.error('Error setting personality data:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('Failed to set personality data') 
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save personality data. Please try again."
      });
    }
  };

  const endSession = () => {
    clearSessionData();
    setState({ sessionId: null, loading: false, error: null });
  };

  return (
    <SessionContext.Provider value={{
      ...state,
      startSession,
      endSession,
      setPersonalityData,
      validateSession
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
