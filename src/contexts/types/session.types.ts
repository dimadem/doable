
import { SessionSelection } from '@/features/vibe-matching/types';
import { StruggleType } from '@/features/struggle/services/sessionService';

export interface StoredPersonalityData {
  personalityKey: string;
  selections: SessionSelection[];
  finalPersonality: string;
}

export interface SessionState {
  sessionId: string | null;
  loading: boolean;
  personalityData?: StoredPersonalityData;
  struggleType?: StruggleType;
  error: Error | null;
}

export interface SessionContextType extends SessionState {
  startSession: () => Promise<boolean>;
  endSession: () => void;
  setPersonalityData: (personalityKey: string, selections: SessionSelection[]) => Promise<void>;
  validateSession: () => Promise<boolean>;
}
