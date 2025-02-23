
import { SessionSelection } from '@/features/vibe-matching/types';

export interface StoredPersonalityData {
  personalityKey: string;
  selections: SessionSelection[];
  finalPersonality: string;
  core_traits?: Record<string, number>;
  behavior_patterns?: Record<string, string>;
}

export interface LocalSessionData {
  sessionId: string;
  startedAt: string;
  personalityData?: StoredPersonalityData;
}
