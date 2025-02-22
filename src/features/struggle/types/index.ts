
export interface SessionData {
  selections: {
    step: number;
    personalityName: string;
  }[];
  finalPersonality: string;
}

export interface PersonalityData {
  name: string;
  core_traits: Record<string, any> | null;
  behavior_patterns: Record<string, any> | null;
}

export interface SessionResponse {
  session_data: SessionData;
  personalities: PersonalityData | null;
}
