
const SESSION_EXPIRY_HOURS = 24;

export interface StoredPersonalityData {
  personalityKey: string;
  selections: Array<{
    step: number;
    personalityName: string;
  }>;
  finalPersonality: string;
}

export const isSessionExpired = (startTime: string): boolean => {
  const sessionStart = new Date(startTime).getTime();
  const currentTime = new Date().getTime();
  const expiryTime = sessionStart + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  return currentTime > expiryTime;
};

export const getSessionData = () => {
  const sessionId = localStorage.getItem('sessionId');
  const personalityData = localStorage.getItem('personalityData');
  
  return {
    sessionId,
    personalityData: personalityData ? JSON.parse(personalityData) : null
  };
};

export const clearSessionData = () => {
  localStorage.removeItem('sessionId');
  localStorage.removeItem('personalityData');
};
