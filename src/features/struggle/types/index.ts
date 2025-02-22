
import { CoreTraits, BehaviorPatterns } from '@/features/vibe-matching/types';
import { Json } from '@/integrations/supabase/types';

export interface SessionSelection {
  step: number;
  personalityName: string;
}

export interface SessionData {
  selections: SessionSelection[];
  finalPersonality: string;
}

export interface SessionResponse {
  id: string;
  session_data: SessionData;
  personalities?: {
    name: string;
    core_traits: CoreTraits;
    behavior_patterns: BehaviorPatterns;
  };
}

export interface PersonalityAnalysis {
  type: string;
  traits: Partial<Record<keyof CoreTraits, number>>;
  patterns: Partial<BehaviorPatterns>;
  selections: SessionSelection[];
}
