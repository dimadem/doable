
import { useState, useCallback } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';
import { ConnectionStatus, VoiceConnectionState } from '../types/connection';

const initialState: VoiceConnectionState = {
  connectionStatus: 'idle',
  taskState: {
    currentTask: null,
    isProcessing: false
  }
};

export const useVoiceConnectionState = (sessionId: string | null) => {
  const [state, setState] = useState<VoiceConnectionState>(initialState);

  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setState(prev => ({ ...prev, connectionStatus: status }));
    sessionLogger.info('Connection status updated', { status, sessionId });
  }, [sessionId]);

  return {
    state,
    setState,
    updateConnectionStatus
  };
};
