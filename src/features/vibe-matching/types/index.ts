
export interface VibeImageProps {
  imageId: string;
  index: number;
  onClick: () => void;
}

export interface ProgressBarProps {
  progress: number;
}

export interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export interface SessionSelection {
  step: number;
  personalityName: string;
}

export interface SessionData {
  selections: SessionSelection[];
  finalPersonality: string;
}

export interface CoreTraits {
  adaptability?: number;
  empathy?: number;
  resilience?: number;
  creativity?: number;
  analytical?: number;
}

export interface BehaviorPatterns {
  communication_style?: 'direct' | 'indirect' | 'analytical' | 'intuitive';
  problem_solving?: 'systematic' | 'creative' | 'collaborative' | 'independent';
  stress_response?: 'adaptive' | 'reactive' | 'proactive' | 'avoidant';
  learning_preference?: 'visual' | 'auditory' | 'kinesthetic' | 'reading/writing';
  work_style?: 'structured' | 'flexible' | 'deadline-driven' | 'self-paced';
}

export interface PersonalityData {
  name: string;
  core_traits: CoreTraits | null;
  behavior_patterns: BehaviorPatterns | null;
}

export interface SessionResponse {
  session_data: SessionData;
  personalities: PersonalityData | null;
}

export interface Personality {
  name: string;
  url_array: string[];
}
