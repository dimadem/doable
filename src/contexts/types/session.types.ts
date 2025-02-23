
import { SessionSelection } from '@/features/vibe-matching/types';

export interface SessionState {
  sessionId: string | null;
  loading: boolean;
  personalityKey?: string;
  sessionData?: {
    selections: SessionSelection[];
    finalPersonality: string;
  };
  error: Error | null;
}

export interface SessionContextType extends SessionState {
  startSession: () => Promise<boolean>;
  endSession: () => void;
  setPersonalityData: (personalityKey: string, selections: SessionSelection[]) => void;
  validateSession: () => Promise<boolean>;
}
