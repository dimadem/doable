
export interface ImageGroup {
  id: string;
  images: string[];
}

export interface VibeImageProps {
  imageId: string;
  index: number;
  onClick: () => void;
}

export interface BackButtonProps {
  onClick: () => void;
}

export interface StatusIndicatorProps {
  status: 'idle' | 'connecting' | 'processing' | 'responding';
}

export interface WaveformVisualizationProps {
  isActive: boolean;
}

export interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// New types for session and personality data
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
  core_traits: Record<string, any> | null;
  behavior_patterns: Record<string, any> | null;
}

export interface SessionResponse {
  session_data: SessionData;
  personalities: PersonalityData | null;
}

export interface Personality {
  id: string;
  name: string;
  url_array: string[];
}
