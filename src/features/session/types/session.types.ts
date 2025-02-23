
import { CoreTraits, BehaviorPatterns, SessionSelection } from '@/features/vibe-matching/types';

export interface StoredPersonalityData {
  personalityKey: string;
  selections: SessionSelection[];
  finalPersonality: string;
  core_traits?: CoreTraits;
  behavior_patterns?: BehaviorPatterns;
}

export interface LocalSessionData {
  sessionId: string;
  startedAt: string;
  personalityData?: StoredPersonalityData;
}
