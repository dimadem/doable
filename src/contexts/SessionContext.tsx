
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { SessionSelection } from '@/features/vibe-matching/types';
import { SessionState, SessionContextType } from './types/session.types';
import { createLocalSession, getSessionData, clearSessionData, updateSessionPersonalityData } from '@/features/session/utils/sessionStorage';
import { validateSessionInDb, updatePersonalityData } from './services/sessionService';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: true,
    error: null
  });

  const validateSession = async () => {
    try {
      if (!state.sessionId) return false;

      const isValid = await validateSessionInDb(state.sessionId);
      if (!isValid) {
        endSession();
        toast({
          title: "Session Error",
          description: "Invalid session. Please start a new session.",
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
        const sessionData = getSessionData();
        
        if (!sessionData) {
          setState({ sessionId: null, loading: false, error: null });
          return;
        }

        // Validate the session
        const isValid = await validateSessionInDb(sessionData.sessionId);
        if (!isValid) {
          clearSessionData();
          setState({ sessionId: null, loading: false, error: null });
          return;
        }

        setState({
          sessionId: sessionData.sessionId,
          personalityData: sessionData.personalityData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Session initialization error:', error);
        setState({ 
          sessionId: null, 
          loading: false, 
          error: error instanceof Error ? error : new Error('Session initialization failed') 
        });
      }
    };

    initSession();
  }, []);

  const startSession = async () => {
    try {
      const sessionData = createLocalSession();
      if (!sessionData) {
        throw new Error('Failed to create local session');
      }

      setState({ 
        sessionId: sessionData.sessionId, 
        loading: false, 
        error: null 
      });

      toast({
        title: "Session Started",
        description: "Your journey has begun."
      });

      return true;
    } catch (error) {
      console.error('Failed to start session:', error);
      setState({ 
        sessionId: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Failed to start session') 
      });
      
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
      if (!state.sessionId) {
        throw new Error('No active session');
      }

      const personalityData = {
        personalityKey,
        selections,
        finalPersonality: personalityKey
      };

      const success = updateSessionPersonalityData(personalityData);
      if (!success) {
        throw new Error('Failed to store personality data');
      }

      await updatePersonalityData(state.sessionId, personalityKey, selections);

      setState(prev => ({
        ...prev,
        personalityData
      }));

    } catch (error) {
      console.error('Error setting personality data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save personality data. Please try again."
      });
      throw error;
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
