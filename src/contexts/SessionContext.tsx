
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { SessionSelection } from '@/features/vibe-matching/types';
import { SessionState, SessionContextType } from './types/session.types';
import { createLocalSession, getSessionData, clearSessionData, updateSessionPersonalityData } from '@/features/session/utils/sessionStorage';
import { validateSessionInDb, updatePersonalityData, initializeSession } from './services/sessionService';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: true,
    error: null
  });

  const validateSession = async () => {
    try {
      if (!state.sessionId) {
        console.log('No session ID to validate');
        return false;
      }

      console.log('Validating session:', state.sessionId);
      const isValid = await validateSessionInDb(state.sessionId);
      
      if (!isValid) {
        console.log('Session invalid, cleaning up...');
        endSession();
        toast({
          title: "Session Error",
          description: "Invalid session. Please start a new session.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Session validated successfully');
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
        console.log('Initializing session from storage');
        const sessionData = getSessionData();
        
        if (!sessionData) {
          console.log('No session data found in storage');
          setState({ sessionId: null, loading: false, error: null });
          return;
        }

        console.log('Found session data, validating:', sessionData.sessionId);
        const isValid = await validateSessionInDb(sessionData.sessionId);
        
        if (!isValid) {
          console.log('Stored session invalid, clearing...');
          clearSessionData();
          setState({ sessionId: null, loading: false, error: null });
          return;
        }

        console.log('Session validated, updating state');
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
      console.log('Starting new session');
      const sessionData = createLocalSession();
      
      if (!sessionData) {
        throw new Error('Failed to create local session');
      }

      console.log('Created local session, initializing in DB:', sessionData.sessionId);
      await initializeSession(sessionData.sessionId);

      setState({ 
        sessionId: sessionData.sessionId, 
        loading: false, 
        error: null 
      });

      toast({
        title: "Session Started",
        description: "Your journey has begun."
      });

      console.log('Session started successfully');
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
