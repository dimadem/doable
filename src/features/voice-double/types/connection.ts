
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface TaskState {
  currentTask: string | null;
  isProcessing: boolean;
}

export interface VoiceConnectionState {
  connectionStatus: ConnectionStatus;
  taskState: TaskState;
}
