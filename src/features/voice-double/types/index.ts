
import { TimerState } from './timer';
import { AudioPermissionState } from './audio';

export type VoiceStatus = 'idle' | 'connecting' | 'connected' | 'closing' | 'error';

export interface VoiceState {
  status: VoiceStatus;
  isSpeaking: boolean;
  conversationId: string | null;
  volume: number;
  permissionState?: AudioPermissionState;
}

export interface VoiceContextType extends VoiceState {
  startInteraction: () => Promise<void>;
  stopInteraction: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

export interface SessionContext {
  taskDescription?: string;
  struggleType?: string;
  lastUpdate: string;
  timer?: {
    duration: number;
    state: TimerState;
  };
}
