
import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../constants/voice';
import { VoiceState, TimerState, VoiceContextType } from '../types/voice';
import { useSession } from '@/contexts/SessionContext';

const initialState: VoiceState = {
  status: 'idle',
  isSpeaking: false,
  conversationId: null
};

const initialTimerState: TimerState = {
  isRunning: false,
  remainingTime: 0,
  duration: 0
};

export const useVoiceState = (): VoiceContextType => {
  const { personalityData, sessionId } = useSession();
  const [state, setState] = useState<VoiceState>(initialState);
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState);
  const isConnectingRef = useRef(false);
  const isDisconnectingRef = useRef(false);
  
  const conversation = useConversation({
    clientTools: {
      set_timer_state: async ({ timer_on }) => {
        setTimerState(prev => ({ ...prev, isRunning: timer_on }));
        return "Timer state updated";
      },
      set_timer_duration: async ({ timer_duration }) => {
        const durationInSeconds = timer_duration * 60;
        setTimerState(prev => ({
          ...prev,
          duration: timer_duration,
          remainingTime: durationInSeconds
        }));
        return "Timer duration set";
      },
      set_task: async ({ task_description, end_conversation = false }) => {
        sessionLogger.info('Task update received', { task_description, end_conversation });
        // Only end conversation if explicitly requested AND no timer is running
        if (end_conversation && !timerState.isRunning) {
          await stopInteraction();
        }
        return "Task handled";
      }
    },
    onConnect: () => {
      isConnectingRef.current = false;
      setState(prev => ({ ...prev, status: 'connected' }));
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      isConnectingRef.current = false;
      isDisconnectingRef.current = false;
      setState(initialState);
      setTimerState(initialTimerState);
      toast({
        title: "Disconnected",
        description: "Voice connection closed"
      });
    },
    onError: (error) => {
      isConnectingRef.current = false;
      isDisconnectingRef.current = false;
      setState(prev => ({ ...prev, status: 'error' }));
      sessionLogger.error('Voice connection error', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish voice connection"
      });
    }
  });

  const startInteraction = useCallback(async () => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current || state.status === 'connected') {
      return;
    }

    try {
      isConnectingRef.current = true;
      setState(prev => ({ ...prev, status: 'connecting' }));
      
      const conversationId = await conversation.startSession({
        agentId: PUBLIC_AGENT_ID,
        dynamicVariables: {
          personality: personalityData?.finalPersonality || 'default',
          end_conversation: false,
          timer_active: false,
          timer_duration: 0
        }
      });

      // Only update the conversationId, let onConnect handle the status change
      setState(prev => ({ 
        ...prev,
        conversationId 
      }));
    } catch (error) {
      isConnectingRef.current = false;
      setState(prev => ({ ...prev, status: 'error' }));
      sessionLogger.error('Failed to start voice interaction', error);
      throw error;
    }
  }, [conversation, personalityData, state.status]);

  const stopInteraction = useCallback(async () => {
    // Prevent multiple disconnection attempts
    if (isDisconnectingRef.current || state.status === 'idle') {
      return;
    }

    try {
      isDisconnectingRef.current = true;
      setState(prev => ({ ...prev, status: 'disconnecting' }));
      
      if (timerState.isRunning) {
        setTimerState(prev => ({ ...prev, isRunning: false }));
      }
      
      await conversation.endSession();
      // Let onDisconnect handle the state reset
    } catch (error) {
      isDisconnectingRef.current = false;
      setState(prev => ({ ...prev, status: 'error' }));
      sessionLogger.error('Failed to stop voice interaction', error);
      throw error;
    }
  }, [conversation, state.status, timerState.isRunning]);

  return {
    ...state,
    startInteraction,
    stopInteraction,
    timerState
  };
};
