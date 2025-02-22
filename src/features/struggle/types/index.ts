
export interface SessionData {
  selections: {
    step: number;
    personalityName: string;
  }[];
  finalPersonality: string;
}

export interface PersonalityData {
  name: string;
}

export interface SessionResponse {
  id: string;
  session_data: SessionData;
  personalities: PersonalityData | null;
}
