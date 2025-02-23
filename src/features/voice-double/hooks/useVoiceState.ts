
import { useState, useCallback } from 'react';
import { useVoiceConnection } from './useVoiceConnection';
import { useVoiceVolume } from './useVoiceVolume';
import { VoiceState, VoiceContextType } from '../types';
import { retryWithBackoff } from '@/utils/retryUtils';
import { sessionLogger } from '@/utils/sessionLogger';

const initialState: VoiceState = {
  status: 'idle',
  isSpeaking: false,
  conversationId: null,
  volume: 1,
  timerState: {
    isRunning: false,
    remainingTime: 0
  }
};

export const useVoiceState = (): VoiceContextType => {
  const [state, setState] = useState<VoiceState>(initialState);
  const { 
    connect, 
    disconnect, 
    status, 
    isSpeaking, 
    timerState,
    permissionState 
  } = useVoiceConnection();
  const { setVoiceVolume } = useVoiceVolume();

  const startInteraction = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'connecting' }));
    
    try {
      const conversationId = await retryWithBackoff(async () => {
        return await connect();
      });

      setState(prev => ({ 
        ...prev, 
        status: 'connected',
        conversationId,
        timerState 
      }));
    } catch (error) {
      setState(prev => ({ ...prev, status: 'error' }));
      sessionLogger.error('Failed to start voice interaction', error);
      throw error;
    }
  }, [connect, timerState]);

  const stopInteraction = useCallback(async () => {
    try {
      // Set status to closing to prevent multiple close attempts
      setState(prev => {
        // Only proceed if not already closing
        if (prev.status === 'closing') {
          return prev;
        }
        return { ...prev, status: 'closing' };
      });

      await disconnect();
      setState(prev => ({ 
        ...prev, 
        status: 'idle',
        conversationId: null,
        isSpeaking: false 
      }));
    } catch (error) {
      sessionLogger.error('Failed to stop voice interaction', error);
      setState(prev => ({ ...prev, status: 'error' }));
      throw error;
    }
  }, [disconnect]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await setVoiceVolume(volume);
      setState(prev => ({ ...prev, volume }));
    } catch (error) {
      sessionLogger.error('Failed to set voice volume', error);
      throw error;
    }
  }, [setVoiceVolume]);

  return {
    ...state,
    startInteraction,
    stopInteraction,
    setVolume,
    timerState: timerState || initialState.timerState
  };
};
