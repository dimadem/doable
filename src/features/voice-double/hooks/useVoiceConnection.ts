import { useCallback, useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';
import { TimerState, TimerContext } from '../types/timer';

const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';
const SESSION_CONTEXT_KEY = 'voice_session_context';

interface SessionContext {
  taskDescription?: string;
  struggleType?: string;
  lastUpdate: string;
  timer?: TimerContext;
}

export const useVoiceConnection = () => {
  const { personalityData, sessionId, struggleType } = useSession();
  const [currentTask, setCurrentTask] = useState<string>();
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false
  });
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const timerInterval = useRef<NodeJS.Timeout>();
  const isClosing = useRef<boolean>(false);

  const handleTimerEnd = useCallback(() => {
    sessionLogger.info('Timer completed', {
      taskDescription: currentTask,
      sessionId,
      timestamp: new Date().toISOString()
    });

    setTimerState(prev => ({ ...prev, isRunning: false }));
    toast({
      title: "Timer Completed",
      description: `Task "${currentTask}" timer has ended`
    });

    // Clear interval
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  }, [currentTask, sessionId]);

  // Timer management
  useEffect(() => {
    if (timerState.isRunning && timerState.remainingTime && timerState.remainingTime > 0) {
      timerInterval.current = setInterval(() => {
        setTimerState(prev => {
          const newRemainingTime = (prev.remainingTime || 0) - 1;
          
          if (newRemainingTime <= 0) {
            handleTimerEnd();
            return { ...prev, isRunning: false, remainingTime: 0 };
          }
          
          return { ...prev, remainingTime: newRemainingTime };
        });
      }, 1000);

      return () => {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
      };
    }
  }, [timerState.isRunning, handleTimerEnd]);

  const loadSavedContext = (): SessionContext | null => {
    const saved = localStorage.getItem(SESSION_CONTEXT_KEY);
    if (saved) {
      const context = JSON.parse(saved);
      sessionLogger.info('Loading saved task context', {
        savedTask: context.taskDescription,
        timerContext: context.timer,
        sessionId,
        struggleType,
        timestamp: new Date().toISOString()
      });

      // Restore timer state if exists
      if (context.timer) {
        setTimerDuration(context.timer.duration);
        setTimerState(context.timer.state);
      }

      return context;
    }
    sessionLogger.info('No saved task context found', { sessionId });
    return null;
  };

  const saveContext = (taskDescription: string) => {
    sessionLogger.info('Updating task context', {
      previousTask: currentTask,
      newTask: taskDescription,
      sessionId,
      struggleType,
      timestamp: new Date().toISOString()
    });

    const context: SessionContext = {
      taskDescription,
      struggleType,
      lastUpdate: new Date().toISOString(),
      timer: {
        duration: timerDuration,
        state: timerState
      }
    };
    
    localStorage.setItem(SESSION_CONTEXT_KEY, JSON.stringify(context));
    setCurrentTask(taskDescription);
    
    sessionLogger.info('Task context saved successfully', {
      taskDescription,
      sessionId,
      struggleType,
      timerContext: context.timer
    });
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

        saveContext(task_description);
        
        if (end_conversation && !isClosing.current) {
          isClosing.current = true;
          sessionLogger.info('Agent requesting session end', {
            task_description,
            sessionId,
            timestamp: new Date().toISOString()
          });
          await conversation.endSession();
        }

        return "Task context stored successfully";
      },
      set_timer_duration: async ({ timer_duration }) => {
        sessionLogger.info('Timer duration update requested', {
          timer_duration,
          sessionId,
          timestamp: new Date().toISOString()
        });

        setTimerDuration(timer_duration);
        setTimerState(prev => ({
          ...prev,
          remainingTime: timer_duration * 60 // Convert minutes to seconds
        }));

        return "Timer duration set successfully";
      },
      set_timer_state: async ({ timer_on }) => {
        sessionLogger.info('Timer state update requested', {
          timer_on,
          sessionId,
          timestamp: new Date().toISOString()
        });

        if (timer_on && timerDuration <= 0) {
          return "Cannot start timer without duration";
        }

        setTimerState(prev => ({
          ...prev,
          isRunning: timer_on,
          startedAt: timer_on ? new Date().toISOString() : undefined
        }));

        return "Timer state updated successfully";
      }
    },
    onConnect: () => {
      isClosing.current = false;
      sessionLogger.info('Voice connection established', { sessionId });
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
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

      await navigator.mediaDevices.getUserMedia({ audio: true });
      const savedContext = loadSavedContext();
      
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

      sessionLogger.info('Voice session started', { 
        conversationId,
        struggleType,
        hasTaskDescription: !!savedContext?.taskDescription,
        timerContext: savedContext?.timer
      });

      return conversationId;
    } catch (error) {
      sessionLogger.error('Failed to start voice session', error);
      throw error;
    }
  }, [conversation, sessionId, personalityData, struggleType]);

  const disconnect = useCallback(async () => {
    try {
      // Only attempt to end session if not already closing
      if (!isClosing.current) {
        isClosing.current = true;
        await conversation.endSession();
      }
      
      sessionLogger.info('Voice session ended', { sessionId });
      
      // Clear timer interval on disconnect
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    } catch (error) {
      sessionLogger.error('Failed to end voice session', error);
      throw error;
    }
  }, [conversation, sessionId]);

  return {
    connect,
    disconnect,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    currentTask,
    timerState,
    timerDuration
  };
};
