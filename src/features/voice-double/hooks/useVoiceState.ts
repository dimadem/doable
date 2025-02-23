
import { useState, useCallback, useMemo } from 'react';
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
  
  // Get connection state
  const { 
    connect, 
    disconnect, 
    status, 
    isSpeaking, 
    timerState,
    permissionState 
  } = useVoiceConnection();

  // Get volume control
  const { setVoiceVolume } = useVoiceVolume();

  const startInteraction = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'connecting' }));
      
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
      setState(prev => {
        if (prev.status === 'closing') return prev;
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

  // Memoize the return value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    startInteraction,
    stopInteraction,
    setVolume,
    timerState: timerState || initialState.timerState
  }), [state, startInteraction, stopInteraction, setVolume, timerState]);

  return contextValue;
};
