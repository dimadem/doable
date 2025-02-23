
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
      
      // Register timer tools
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
      
      // Cleanup timer state
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
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', { message });
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

  const connect = useCallback(async () => {
    try {
      if (!sessionId) {
        throw new Error('No active session');
      }

      if (!struggleType) {
        throw new Error('No struggle type selected');
      }

      if (isDisconnectingRef.current) {
        throw new Error('Cannot connect while disconnecting');
      }

      updateConnectionStatus('connecting');
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Audio permission denied');
      }

      const savedContext = loadVoiceContext(sessionId);
      
      sessionLogger.info('Starting voice session', { 
        sessionId,
        hasTaskDescription: !!savedContext?.taskDescription,
        hasTimer: !!savedContext?.timer,
        struggleType
      });

      const conversationId = await conversation.startSession({
        agentId: PUBLIC_AGENT_ID,
        dynamicVariables: {
          personality: personalityData?.finalPersonality || 'default',
          struggle_type: struggleType,
          task_description: savedContext?.taskDescription || undefined,
          timer_duration: savedContext?.timer?.duration,
          timer_active: savedContext?.timer?.state.isRunning
        }
      });

      return conversationId;
    } catch (error) {
      updateConnectionStatus('error');
      sessionLogger.error('Failed to start voice session', error);
      throw error;
    }
  }, [conversation, sessionId, struggleType, personalityData, requestPermission, updateConnectionStatus]);

  const disconnect = useCallback(async () => {
    if (isDisconnectingRef.current || !wsReadyRef.current) {
      sessionLogger.info('Already disconnecting or not connected');
      return;
    }

    try {
      isDisconnectingRef.current = true;
      updateConnectionStatus('disconnecting');
      
      // Cleanup in order
      if (timerState.isRunning) {
        setTimerRunning(false);
      }
      setTimerDurationMinutes(0);
      cleanupAudio();
      cleanupTimer();
      
      wsReadyRef.current = false;
      await conversation.endSession();
      
      sessionLogger.info('Voice session ended', { sessionId });
    } catch (error) {
      if (error.message?.includes('CLOSING') || error.message?.includes('CLOSED')) {
        sessionLogger.info('WebSocket already closing or closed');
      } else {
        sessionLogger.error('Failed to end voice session', error);
        throw error;
      }
    } finally {
      isDisconnectingRef.current = false;
      updateConnectionStatus('idle');
    }
  }, [conversation, sessionId, timerState.isRunning, cleanupAudio, cleanupTimer, updateConnectionStatus, setTimerRunning, setTimerDurationMinutes]);

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
