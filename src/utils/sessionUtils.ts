
const SESSION_EXPIRY_HOURS = 24;

export interface StoredPersonalityData {
  personalityKey: string;
  selections: Array<{
    step: number;
    personalityName: string;
  }>;
  finalPersonality: string;
}

interface LocalSessionData {
  sessionId: string;
  startedAt: string;
  personalityData?: StoredPersonalityData;
}

export const generateSessionId = () => crypto.randomUUID();

export const createLocalSession = () => {
  const sessionData: LocalSessionData = {
    sessionId: generateSessionId(),
    startedAt: new Date().toISOString()
  };
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
  return sessionData;
};

export const isSessionExpired = (startTime: string): boolean => {
  const sessionStart = new Date(startTime).getTime();
  const currentTime = new Date().getTime();
  const expiryTime = sessionStart + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  return currentTime > expiryTime;
};

export const getSessionData = (): LocalSessionData | null => {
  const data = localStorage.getItem('sessionData');
  return data ? JSON.parse(data) : null;
};

export const updateSessionPersonalityData = (personalityData: StoredPersonalityData) => {
  const currentData = getSessionData();
  if (currentData) {
    const updatedData = {
      ...currentData,
      personalityData
    };
    localStorage.setItem('sessionData', JSON.stringify(updatedData));
  }
};

export const clearSessionData = () => {
  localStorage.removeItem('sessionData');
};
