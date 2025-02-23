
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export type VoiceAction = 
  | { type: 'INIT_CONNECTION' }
  | { type: 'CONNECTION_SUCCESS'; conversationId: string }
  | { type: 'CONNECTION_FAILED'; error?: Error }
  | { type: 'BEGIN_DISCONNECT' }
  | { type: 'DISCONNECTED' }
  | { type: 'UPDATE_SPEAKING'; isSpeaking: boolean }
  | { type: 'SET_TIMER'; timerState: TimerState }
  | { type: 'ALLOW_END_CONVERSATION' };

export interface VoiceState {
  status: ConnectionStatus;
  isSpeaking: boolean;
  conversationId: string | null;
  canEndConversation: boolean;
  error?: Error;
}

export interface TimerState {
  isRunning: boolean;
  remainingTime: number;
  duration: number;
}

export interface VoiceContextValue {
  state: VoiceState;
  timerState: TimerState;
  actions: {
    startInteraction: () => Promise<void>;
    stopInteraction: () => Promise<void>;
  };
}
