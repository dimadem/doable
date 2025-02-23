
import { useCallback, useState, useRef, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../constants/voice';
import { useVoiceTimer } from './useVoiceTimer';
import { useVoiceAudioPermission } from './useVoiceAudioPermission';
import { saveVoiceContext, loadVoiceContext } from '../services/voiceStorageService';
import { ConnectionStatus, VoiceConnectionState } from '../types/connection';

const initialState: VoiceConnectionState = {
  connectionStatus: 'idle',
  taskState: {
    currentTask: null,
    isProcessing: false
  }
};

export const useVoiceConnection = () => {
  const { personalityData, sessionId, struggleType } = useSession();
  const [state, setState] = useState<VoiceConnectionState>(initialState);
  const { permissionState, requestPermission, cleanup: cleanupAudio } = useVoiceAudioPermission();
  const isDisconnectingRef = useRef(false);
  
  // Refs for managing client tools
  const clientToolsRef = useRef<{
    setTimerState?: (isRunning: boolean) => Promise<void>;
    setTimerDuration?: (duration: number) => Promise<void>;
  }>({});

  // Timer handling with completion callback
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
      if (clientToolsRef.current.setTimerState) {
        await clientToolsRef.current.setTimerState(false);
      }
      if (clientToolsRef.current.setTimerDuration) {
        await clientToolsRef.current.setTimerDuration(0);
      }
    }
  });

  // Refs for managing async operations
  const isProcessingRef = useRef(false);
  const wsReadyRef = useRef(false);

  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setState(prev => ({ ...prev, connectionStatus: status }));
    sessionLogger.info('Connection status updated', { status, sessionId });
  }, [sessionId]);

  const handleTask = useCallback(async (task_description: string, end_conversation: boolean) => {
    if (isProcessingRef.current || !wsReadyRef.current) {
      sessionLogger.warn('Task handling blocked - processing or WS not ready', { 
        isProcessing: isProcessingRef.current, 
        wsReady: wsReadyRef.current 
      });
      return;
    }

    isProcessingRef.current = true;
    setState(prev => ({
      ...prev,
      taskState: {
        ...prev.taskState,
        isProcessing: true,
        currentTask: task_description
      }
    }));

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
      setState(prev => ({
        ...prev,
        taskState: {
          ...prev.taskState,
          isProcessing: false,
          currentTask: task_description
        }
      }));

      return "Task handled successfully";
    } catch (error) {
      isProcessingRef.current = false;
      setState(prev => ({
        ...prev,
        taskState: { ...prev.taskState, isProcessing: false }
      }));
      throw error;
    }
  }, [sessionId, struggleType, timerDuration, timerState, updateConnectionStatus]);

  const conversation = useConversation({
    clientTools: {
      set_task: async ({ task_description, end_conversation = false }) => {
        sessionLogger.info('Task request received', { task_description, end_conversation });
        return handleTask(task_description, end_conversation);
      },
      set_timer_duration: async ({ timer_duration }) => {
        if (!wsReadyRef.current) {
          return "WebSocket not ready";
        }
        
        sessionLogger.info('Timer duration update requested', { timer_duration });
        setTimerDurationMinutes(timer_duration);

        clientToolsRef.current.setTimerDuration = async (duration: number) => {
          setTimerDurationMinutes(duration);
        };

        return "Timer duration set successfully";
      },
      set_timer_state: async ({ timer_on }) => {
        if (!wsReadyRef.current) {
          return "WebSocket not ready";
        }

        const success = setTimerRunning(timer_on);

        clientToolsRef.current.setTimerState = async (isRunning: boolean) => {
          setTimerRunning(isRunning);
        };

        return success ? "Timer state updated successfully" : "Cannot start timer without duration";
      }
    },
    onConnect: () => {
      wsReadyRef.current = true;
      isDisconnectingRef.current = false;
      updateConnectionStatus('connected');
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
      
      // Cleanup timer state on disconnect
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
      
      // Stop timer if running
      if (timerState.isRunning) {
        setTimerRunning(false);
      }
      
      // Reset timer duration
      setTimerDurationMinutes(0);
      
      // Clean up audio first
      cleanupAudio();
      
      // Clean up timer
      cleanupTimer();
      
      // End WebSocket session
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

  // Cleanup effect
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
