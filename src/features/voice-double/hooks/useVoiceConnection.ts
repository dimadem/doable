
import { useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../constants/voice';
import { useVoiceTimer } from './useVoiceTimer';
import { useVoiceAudioPermission } from './useVoiceAudioPermission';
import { loadVoiceContext } from '../services/voiceStorageService';
import { useVoiceClientTools } from './useVoiceClientTools';
import { useVoiceTaskHandler } from './useVoiceTaskHandler';
import { useVoiceConnectionState } from './useVoiceConnectionState';

export const useVoiceConnection = () => {
  const { personalityData, sessionId, struggleType } = useSession();
  const { state, updateConnectionStatus } = useVoiceConnectionState(sessionId);
  const { permissionState, requestPermission, cleanup: cleanupAudio } = useVoiceAudioPermission();
  const isDisconnectingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const wsReadyRef = useRef(false);

  // Initialize client tools first
  const { clientTools, registerTimerTools } = useVoiceClientTools(wsReadyRef);

  const {
    timerState,
    timerDuration,
    setTimerDurationMinutes,
    setTimerRunning,
    cleanup: cleanupTimer
  } = useVoiceTimer({
    currentTask: state.taskState.currentTask || undefined,
    sessionId,
    onTimerComplete: async () => {
      if (clientTools.set_timer_state) {
        await clientTools.set_timer_state({ timer_on: false });
      }
      setTimerDurationMinutes(0);
    }
  });

  const conversation = useConversation({
    clientTools: {
      set_task: async ({ task_description, end_conversation = false }) => {
        sessionLogger.info('Task request received', { task_description, end_conversation });
        return handleTask(task_description, end_conversation);
      },
      ...clientTools
    },
    onConnect: () => {
      wsReadyRef.current = true;
      isDisconnectingRef.current = false;
      updateConnectionStatus('connected');
      
      registerTimerTools(
        async (isRunning) => {
          await setTimerRunning(isRunning);
          return;
        },
        async (duration) => {
          setTimerDurationMinutes(duration);
          return;
        }
      );
      
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      wsReadyRef.current = false;
      isProcessingRef.current = false;
      isDisconnectingRef.current = false;
      updateConnectionStatus('idle');
      
      setTimerRunning(false);
      setTimerDurationMinutes(0);
      
      toast({
        title: "Disconnected",
        description: "Voice connection closed"
      });
    },
    onError: (error) => {
      wsReadyRef.current = false;
      isProcessingRef.current = false;
      isDisconnectingRef.current = false;
      updateConnectionStatus('error');
      sessionLogger.error('Voice connection error', { error });
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish voice connection"
      });
    }
  });

  const { handleTask } = useVoiceTaskHandler({
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
  });

  useEffect(() => {
    return () => {
      cleanupTimer();
      cleanupAudio();
    };
  }, [cleanupTimer, cleanupAudio]);

  return {
    connect,
    disconnect,
    status: state.connectionStatus,
    isSpeaking: conversation.isSpeaking,
    currentTask: state.taskState.currentTask,
    timerState,
    timerDuration,
    permissionState
  };
};
