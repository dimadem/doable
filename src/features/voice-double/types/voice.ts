
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface VoiceState {
  status: ConnectionStatus;
  isSpeaking: boolean;
  conversationId: string | null;
}

export interface TimerState {
  isRunning: boolean;
  remainingTime: number;
  duration: number;
}

export interface VoiceContextType extends VoiceState {
  startInteraction: () => Promise<void>;
  stopInteraction: () => Promise<void>;
  timerState: TimerState;
}
