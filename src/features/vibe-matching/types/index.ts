
import { Json } from '@/integrations/supabase/types';

export interface MediaMetadata {
  url: string;
  width?: number;
  height?: number;
  format?: string;
  loading: boolean;
  error: boolean;
  isVideo: boolean;
}

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

export interface Personality {
  id: string;
  name: string;
  url_array: string[] | null;
  url_metadata: MediaMetadata[] | null;
  core_traits: CoreTraits | null;
  behavior_patterns: BehaviorPatterns | null;
  description?: string | null;
  created_at?: string | null;
}

export interface UserSession {
  id: string;
  personality_key: string;
  session_data: Json;
  started_at: string | null;
  ended_at: string | null;
  user_id?: string | null;
  session_id?: string | null;
  struggle_type?: string | null;
  session_feedback?: Json | null;
  device_info?: Json | null;
  relevant_agent?: string | null;
}
