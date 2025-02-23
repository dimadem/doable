
import { useCallback } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';
import { saveVoiceContext } from '../services/voiceStorageService';
import { TimerState } from '../types/timer';
import type { Conversation } from '../types/elevenlabs';

interface UseVoiceTaskHandlerProps {
  sessionId: string | null;
  struggleType: string | undefined;
  timerDuration: number;
  timerState: TimerState;
  updateConnectionStatus: (status: 'disconnecting') => void;
  wsReadyRef: React.RefObject<boolean>;
  isProcessingRef: React.MutableRefObject<boolean>;
  conversation: Conversation;
  cleanupAudio: () => void;
  cleanupTimer: () => void;
}

export const useVoiceTaskHandler = ({
  sessionId,
  struggleType,
  timerDuration,
  timerState,
  updateConnectionStatus,
  wsReadyRef,
  isProcessingRef,
  conversation,
  cleanupAudio,
  cleanupTimer
}: UseVoiceTaskHandlerProps) => {
  const handleEndConversation = useCallback(async () => {
    try {
      updateConnectionStatus('disconnecting');
      
      // Cleanup resources
      cleanupAudio();
      cleanupTimer();
      
      // End the conversation using ElevenLabs API
      await conversation.endSession();
      
      sessionLogger.info('Voice session ended by task completion', { sessionId });
    } catch (error) {
      if (error.message?.includes('CLOSING') || error.message?.includes('CLOSED')) {
        sessionLogger.info('WebSocket already closing or closed');
      } else {
        sessionLogger.error('Failed to end voice session after task completion', error);
        throw error;
      }
    }
  }, [sessionId, conversation, cleanupAudio, cleanupTimer, updateConnectionStatus]);

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
      // Save task context first
      saveVoiceContext(
        task_description,
        struggleType,
        timerDuration,
        timerState,
        sessionId
      );

      // Handle end conversation if requested and no timer is running
      if (end_conversation && !timerState.isRunning) {
        await handleEndConversation();
      }

      isProcessingRef.current = false;
      return "Task handled successfully";
    } catch (error) {
      isProcessingRef.current = false;
      throw error;
    }
  }, [
    sessionId,
    struggleType,
    timerDuration,
    timerState,
    handleEndConversation,
    wsReadyRef,
    isProcessingRef
  ]);

  return {
    handleTask
  };
};
