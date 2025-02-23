
import { useCallback, useState, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../constants/voice';
import { useVoiceTimer } from './useVoiceTimer';
import { useVoiceAudioPermission } from './useVoiceAudioPermission';
import { saveVoiceContext, loadVoiceContext } from '../services/voiceStorageService';

export const useVoiceConnection = () => {
  const { personalityData, sessionId, struggleType } = useSession();
  const [currentTask, setCurrentTask] = useState<string>();
  const isClosing = useRef<boolean>(false);
  const isSettingUpTimer = useRef<boolean>(false);
  const { permissionState, requestPermission, cleanup: cleanupAudio } = useVoiceAudioPermission();
  
  const {
    timerState,
    timerDuration,
    setTimerDurationMinutes,
    setTimerRunning,
    cleanup: cleanupTimer
  } = useVoiceTimer(currentTask, sessionId);

  const handleEndConversation = async (conversation: any, task_description: string) => {
    if (isClosing.current || timerState.isRunning || isSettingUpTimer.current) {
      return;
    }

    isClosing.current = true;
    sessionLogger.info('Agent requesting session end', {
      task_description,
      sessionId,
      timestamp: new Date().toISOString()
    });

    try {
      await conversation.endSession();
    } catch (error) {
      if (error.message?.includes('CLOSING') || error.message?.includes('CLOSED')) {
        sessionLogger.info('WebSocket already closing or closed');
      } else {
        throw error;
      }
    }
  };

  const conversation = useConversation({
    clientTools: {
      set_task: async ({ end_conversation, task_description }) => {
        sessionLogger.info('Task identified by agent', { 
          task_description,
          sessionId,
          struggleType,
          timestamp: new Date().toISOString()
        });

        saveVoiceContext(
          task_description,
          struggleType,
          timerDuration,
          timerState,
          sessionId
        );
        
        setCurrentTask(task_description);
        
        if (end_conversation) {
          await handleEndConversation(conversation, task_description);
        }

        return "Task context stored successfully";
      },
      set_timer_duration: async ({ timer_duration }) => {
        isSettingUpTimer.current = true;
        sessionLogger.info('Timer duration update requested', {
          timer_duration,
          sessionId,
          timestamp: new Date().toISOString()
        });

        setTimerDurationMinutes(timer_duration);
        isSettingUpTimer.current = false;
        return "Timer duration set successfully";
      },
      set_timer_state: async ({ timer_on }) => {
        isSettingUpTimer.current = true;
        sessionLogger.info('Timer state update requested', {
          timer_on,
          sessionId,
          timestamp: new Date().toISOString()
        });

        const success = setTimerRunning(timer_on);
        isSettingUpTimer.current = false;
        
        if (!success) {
          return "Cannot start timer without duration";
        }

        return "Timer state updated successfully";
      }
    },
    onConnect: () => {
      isClosing.current = false;
      isSettingUpTimer.current = false;
      sessionLogger.info('Voice connection established', { sessionId });
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      isClosing.current = false;
      isSettingUpTimer.current = false;
      sessionLogger.info('Voice connection closed', { sessionId });
      toast({
        title: "Disconnected",
        description: "Voice connection closed"
      });
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', { error, sessionId });
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish voice connection"
      });
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', { message, sessionId });
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
      sessionLogger.error('Failed to start voice session', error);
      throw error;
    }
  }, [conversation, sessionId, personalityData, struggleType, requestPermission]);

  const disconnect = useCallback(async () => {
    try {
      if (!isClosing.current) {
        isClosing.current = true;
        try {
          await conversation.endSession();
        } catch (error) {
          if (error.message?.includes('CLOSING') || error.message?.includes('CLOSED')) {
            // WebSocket already closing/closed, ignore the error
            sessionLogger.info('WebSocket already closing or closed');
          } else {
            throw error;
          }
        }
      }
      
      sessionLogger.info('Voice session ended', { sessionId });
      cleanupAudio();
      // Don't cleanup timer here, let it run independently
    } catch (error) {
      sessionLogger.error('Failed to end voice session', error);
      throw error;
    }
  }, [conversation, sessionId, cleanupAudio]);

  return {
    connect,
    disconnect,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    currentTask,
    timerState,
    timerDuration,
    permissionState
  };
};
