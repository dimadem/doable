
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { SessionSelection } from '@/features/vibe-matching/types';
import { SessionState } from '../types/session.types';
import { createLocalSession, getSessionData, clearSessionData, updateSessionPersonalityData } from '../utils/sessionStorage';
import { validateSessionInDb, updatePersonalityData, initializeSession } from '../services/sessionService';
import { sessionLogger } from '@/utils/sessionLogger';

export const useSessionState = () => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: true,
    error: null
  });

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

  return {
    state,
    setState,
    startSession,
    setPersonalityData,
    endSession
  };
};
