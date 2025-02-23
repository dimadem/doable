
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export type VoiceAction = 
  | { type: 'START_CONNECTING' }
  | { type: 'CONNECTION_ESTABLISHED'; conversationId: string }
  | { type: 'START_DISCONNECTING' }
  | { type: 'CONNECTION_CLOSED' }
  | { type: 'CONNECTION_ERROR' }
  | { type: 'SET_SPEAKING'; isSpeaking: boolean }
  | { type: 'UPDATE_TIMER'; timerState: TimerState };

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

export interface VoiceContextValue {
  connection: {
    status: ConnectionStatus;
    conversationId: string | null;
  };
  speech: {
    isSpeaking: boolean;
  };
  timer: TimerState;
  actions: {
    startInteraction: () => Promise<void>;
    stopInteraction: () => Promise<void>;
  };
}

export interface VoiceContextType extends VoiceState {
  startInteraction: () => Promise<void>;
  stopInteraction: () => Promise<void>;
  timerState: TimerState;
}
