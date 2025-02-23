
import { LocalSessionData, StoredPersonalityData } from '../types/session.types';
import { isValidCoreTraits, isValidBehaviorPatterns } from './typeValidation';

const SESSION_KEY = 'sessionData';
const SESSION_EXPIRY_HOURS = 24;

export const generateSessionId = () => crypto.randomUUID();

export const createLocalSession = (): LocalSessionData | null => {
  try {
    const sessionData: LocalSessionData = {
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  } catch (error) {
    console.error('Failed to create local session:', error);
    return null;
  }
};

export const getSessionData = (): LocalSessionData | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get session data:', error);
    return null;
  }
};

export const isSessionExpired = (startTime: string): boolean => {
  const sessionStart = new Date(startTime).getTime();
  const currentTime = new Date().getTime();
  const expiryTime = sessionStart + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  return currentTime > expiryTime;
};

export const updateSessionPersonalityData = (personalityData: StoredPersonalityData): boolean => {
  try {
    // Validate core traits and behavior patterns
    if (personalityData.core_traits && !isValidCoreTraits(personalityData.core_traits)) {
      console.error('Invalid core traits format');
      return false;
    }

    if (personalityData.behavior_patterns && !isValidBehaviorPatterns(personalityData.behavior_patterns)) {
      console.error('Invalid behavior patterns format');
      return false;
    }

    const currentData = getSessionData();
    if (!currentData) {
      console.error('No current session data found');
      return false;
    }

    const updatedData = {
      ...currentData,
      personalityData: {
        ...personalityData,
        // Ensure we have valid default objects even if null/undefined
        core_traits: personalityData.core_traits || {},
        behavior_patterns: personalityData.behavior_patterns || {}
      }
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Failed to update personality data:', error);
    return false;
  }
};

export const clearSessionData = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session data:', error);
  }
};
