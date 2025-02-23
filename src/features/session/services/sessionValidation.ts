
import { sessionLogger } from '@/utils/sessionLogger';
import { validateSessionInDb } from './sessionService';
import { getSessionData, clearSessionData } from '../utils/sessionStorage';
import { toast } from "@/components/ui/use-toast";
import { SessionState } from '../types/session.types';

export const validateSession = async (sessionId: string | null) => {
  try {
    if (!sessionId) {
      sessionLogger.info('No session ID to validate');
      return false;
    }

    sessionLogger.info('Validating session', { sessionId });
    const isValid = await validateSessionInDb(sessionId);
    
    if (!isValid) {
      sessionLogger.warn('Session invalid', { sessionId });
      clearSessionData();
      toast({
        title: "Session Error",
        description: "Invalid session. Please start a new session.",
        variant: "destructive"
      });
      return false;
    }

    sessionLogger.info('Session validated successfully', { sessionId });
    return true;
  } catch (error) {
    sessionLogger.error('Session validation error', { error, sessionId });
    clearSessionData();
    return false;
  }
};

export const initializeStoredSession = async (): Promise<SessionState> => {
  try {
    sessionLogger.info('Initializing session from storage');
    const sessionData = getSessionData();
    
    if (!sessionData) {
      sessionLogger.info('No session data found in storage');
      return { sessionId: null, loading: false, error: null };
    }

    sessionLogger.info('Found session data', { 
      sessionId: sessionData.sessionId,
      struggleType: sessionData.struggleType 
    });
    
    const isValid = await validateSessionInDb(sessionData.sessionId);
    
    if (!isValid) {
      sessionLogger.warn('Stored session invalid', { sessionId: sessionData.sessionId });
      clearSessionData();
      return { sessionId: null, loading: false, error: null };
    }

    sessionLogger.info('Session validated, updating state', { 
      sessionId: sessionData.sessionId,
      hasPersonalityData: !!sessionData.personalityData,
      struggleType: sessionData.struggleType
    });
    
    return {
      sessionId: sessionData.sessionId,
      personalityData: sessionData.personalityData,
      struggleType: sessionData.struggleType,
      loading: false,
      error: null
    };
  } catch (error) {
    sessionLogger.error('Session initialization error', { error });
    return { 
      sessionId: null, 
      loading: false, 
      error: error instanceof Error ? error : new Error('Session initialization failed') 
    };
  }
};
