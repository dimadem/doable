
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

export interface SessionState {
  sessionId: string | null;
  loading: boolean;
  personalityData?: StoredPersonalityData;
  error: Error | null;
}

export interface SessionContextType extends SessionState {
  startSession: () => Promise<boolean>;
  endSession: () => void;
  setPersonalityData: (personalityKey: string, selections: SessionSelection[]) => Promise<void>;
  validateSession: () => Promise<boolean>;
}
