
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
  volume: 1
};

export const useVoiceState = (): VoiceContextType => {
  const [state, setState] = useState<VoiceState>(initialState);
  const { connect, disconnect } = useVoiceConnection();
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
        conversationId 
      }));
    } catch (error) {
      setState(prev => ({ ...prev, status: 'error' }));
      sessionLogger.error('Failed to start voice interaction', error);
      throw error;
    }
  }, [connect]);

  const stopInteraction = useCallback(async () => {
    try {
      await disconnect();
      setState(prev => ({ 
        ...prev, 
        status: 'idle',
        conversationId: null,
        isSpeaking: false 
      }));
    } catch (error) {
      sessionLogger.error('Failed to stop voice interaction', error);
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
    setVolume
  };
};
