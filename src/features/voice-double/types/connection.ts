
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface VoiceConnectionState {
  connectionStatus: ConnectionStatus;
  taskState: {
    currentTask: string | null;
    isProcessing: boolean;
  };
}
