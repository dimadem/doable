
import { CoreTraits, BehaviorPatterns } from '@/features/vibe-matching/types';

export interface SessionData {
  selections: {
    step: number;
    personalityName: string;
  }[];
  finalPersonality: string;
}

export interface PersonalityData {
  name: string;
  core_traits: CoreTraits | null;
  behavior_patterns: BehaviorPatterns | null;
}

export interface SessionResponse {
  id: string;
  session_data: SessionData;
  personalities: PersonalityData | null;
}
