
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { SessionSelection } from '@/features/vibe-matching/types';
import { SessionState, SessionContextType } from './types/session.types';
import { createLocalSession, getSessionData, clearSessionData, updateSessionPersonalityData } from '@/features/session/utils/sessionStorage';
import { validateSessionInDb, updatePersonalityData, initializeSession } from './services/sessionService';
import { sessionLogger } from '@/utils/sessionLogger';

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
        sessionLogger.info('No session ID to validate');
        return false;
      }

      sessionLogger.info('Validating session', { sessionId: state.sessionId });
      const isValid = await validateSessionInDb(state.sessionId);
      
      if (!isValid) {
        sessionLogger.warn('Session invalid, cleaning up', { sessionId: state.sessionId });
        endSession();
        toast({
          title: "Session Error",
          description: "Invalid session. Please start a new session.",
          variant: "destructive"
        });
        return false;
      }

      sessionLogger.info('Session validated successfully', { sessionId: state.sessionId });
      return true;
    } catch (error) {
      sessionLogger.error('Session validation error', { error, sessionId: state.sessionId });
      endSession();
      return false;
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        sessionLogger.info('Initializing session from storage');
        const sessionData = getSessionData();
        
        if (!sessionData) {
          sessionLogger.info('No session data found in storage');
          setState({ sessionId: null, loading: false, error: null });
          return;
        }

        sessionLogger.info('Found session data', { 
          sessionId: sessionData.sessionId,
          struggleType: sessionData.struggleType 
        });
        
        const isValid = await validateSessionInDb(sessionData.sessionId);
        
        if (!isValid) {
          sessionLogger.warn('Stored session invalid', { sessionId: sessionData.sessionId });
          clearSessionData();
          setState({ sessionId: null, loading: false, error: null });
          return;
        }

        sessionLogger.info('Session validated, updating state', { 
          sessionId: sessionData.sessionId,
          hasPersonalityData: !!sessionData.personalityData,
          struggleType: sessionData.struggleType
        });
        
        setState({
          sessionId: sessionData.sessionId,
          personalityData: sessionData.personalityData,
          struggleType: sessionData.struggleType,
          loading: false,
          error: null
        });
      } catch (error) {
        sessionLogger.error('Session initialization error', { error });
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
      sessionLogger.info('Starting new session');
      const sessionData = createLocalSession();
      
      if (!sessionData) {
        throw new Error('Failed to create local session');
      }

      sessionLogger.info('Created local session', { sessionId: sessionData.sessionId });
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

      sessionLogger.info('Session started successfully', { sessionId: sessionData.sessionId });
      return true;
    } catch (error) {
      sessionLogger.error('Failed to start session', { error });
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

      sessionLogger.info('Setting personality data', { 
        sessionId: state.sessionId,
        personalityKey,
        selectionsCount: selections.length
      });

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

      sessionLogger.info('Personality data set successfully', { 
        sessionId: state.sessionId,
        personalityKey
      });

    } catch (error) {
      sessionLogger.error('Error setting personality data', { 
        error,
        sessionId: state.sessionId
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save personality data. Please try again."
      });
      throw error;
    }
  };

  const endSession = () => {
    if (state.sessionId) {
      sessionLogger.info('Ending session', { sessionId: state.sessionId });
    }
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
