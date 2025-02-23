
import { LocalSessionData, StoredPersonalityData } from '../types/session.types';

const SESSION_KEY = 'sessionData';
const SESSION_EXPIRY_HOURS = 24;

export const generateSessionId = () => crypto.randomUUID();

export const createLocalSession = () => {
  const sessionData: LocalSessionData = {
    sessionId: generateSessionId(),
    startedAt: new Date().toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return sessionData;
};

export const getSessionData = (): LocalSessionData | null => {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const isSessionExpired = (startTime: string): boolean => {
  const sessionStart = new Date(startTime).getTime();
  const currentTime = new Date().getTime();
  const expiryTime = sessionStart + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  return currentTime > expiryTime;
};

export const updateSessionPersonalityData = (personalityData: StoredPersonalityData) => {
  const currentData = getSessionData();
  if (!currentData) return;

  const updatedData = {
    ...currentData,
    personalityData
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedData));
};

export const clearSessionData = () => {
  localStorage.removeItem(SESSION_KEY);
};
