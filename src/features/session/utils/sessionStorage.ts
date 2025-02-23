
import { LocalSessionData, StoredPersonalityData } from '../types/session.types';
import { StruggleType } from '@/features/struggle/services/sessionService';

const SESSION_KEY = 'lb_session';
const SESSION_EXPIRY_HOURS = 24;

export const generateSessionId = () => crypto.randomUUID();

export const createLocalSession = (): LocalSessionData | null => {
  try {
    const sessionData: LocalSessionData = {
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    // Verify the data was written correctly
    const verified = getSessionData();
    if (!verified || verified.sessionId !== sessionData.sessionId) {
      console.error('Session data verification failed');
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Failed to create local session:', error);
    return null;
  }
};

export const getSessionData = (): LocalSessionData | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) {
      console.log('No session data found in localStorage');
      return null;
    }
    
    const parsed = JSON.parse(data);
    if (!parsed.sessionId || !parsed.startedAt) {
      console.error('Invalid session data format');
      return null;
    }

    // Get struggle type from session context
    const contextData = localStorage.getItem('voice_session_context');
    if (contextData) {
      const context = JSON.parse(contextData);
      if (context.struggleType) {
        parsed.struggleType = context.struggleType;
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to get session data:', error);
    return null;
  }
};

export const updateSessionPersonalityData = (personalityData: StoredPersonalityData): boolean => {
  try {
    const currentData = getSessionData();
    if (!currentData) {
      console.error('No current session data found');
      return false;
    }

    const updatedData = {
      ...currentData,
      personalityData: {
        ...personalityData,
        core_traits: personalityData.core_traits || {},
        behavior_patterns: personalityData.behavior_patterns || {}
      }
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedData));
    
    // Verify the data was written correctly
    const verified = getSessionData();
    if (!verified?.personalityData) {
      console.error('Failed to verify personality data storage');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update personality data:', error);
    return false;
  }
};

export const clearSessionData = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('voice_session_context');
  } catch (error) {
    console.error('Failed to clear session data:', error);
  }
};

export const isSessionExpired = (startTime: string): boolean => {
  const sessionStart = new Date(startTime).getTime();
  const currentTime = new Date().getTime();
  const expiryTime = sessionStart + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  return currentTime > expiryTime;
};
