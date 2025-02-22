
export interface VibeImageProps {
  imageId: string;
  index: number;
  onClick: () => void;
}

export interface ProgressBarProps {
  progress: number;
}

export interface SessionSelection {
  step: number;
  personalityName: string;
}

export interface SessionData {
  selections: SessionSelection[];
  finalPersonality: string;
}

export interface PersonalityData {
  name: string;
}

export interface SessionResponse {
  session_data: SessionData;
  personalities: PersonalityData | null;
}

export interface Personality {
  name: string;
  url_array: string[];
}
