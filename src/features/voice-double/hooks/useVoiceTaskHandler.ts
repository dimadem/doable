
import { useCallback } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';
import { saveVoiceContext } from '../services/voiceStorageService';
import { TimerState } from '../types/timer';

interface UseVoiceTaskHandlerProps {
  sessionId: string | null;
  struggleType: string | undefined;
  timerDuration: number;
  timerState: TimerState;
  updateConnectionStatus: (status: 'disconnecting') => void;
  wsReadyRef: React.RefObject<boolean>;
  isProcessingRef: React.RefObject<boolean>;
}

export const useVoiceTaskHandler = ({
  sessionId,
  struggleType,
  timerDuration,
  timerState,
  updateConnectionStatus,
  wsReadyRef,
  isProcessingRef
}: UseVoiceTaskHandlerProps) => {
  const handleTask = useCallback(async (task_description: string, end_conversation: boolean) => {
    if (isProcessingRef.current || !wsReadyRef.current) {
      sessionLogger.warn('Task handling blocked - processing or WS not ready', { 
        isProcessing: isProcessingRef.current, 
        wsReady: wsReadyRef.current 
      });
      return;
    }

    isProcessingRef.current = true;

    try {
      saveVoiceContext(
        task_description,
        struggleType,
        timerDuration,
        timerState,
        sessionId
      );

      if (end_conversation && !timerState.isRunning) {
        updateConnectionStatus('disconnecting');
      }

      isProcessingRef.current = false;
      return "Task handled successfully";
    } catch (error) {
      isProcessingRef.current = false;
      throw error;
    }
  }, [sessionId, struggleType, timerDuration, timerState, updateConnectionStatus, wsReadyRef, isProcessingRef]);

  return {
    handleTask
  };
};
