
import { useState, useCallback } from 'react';
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
      set_task: async ({ task_description, end_conversation }) => {
        if (end_conversation && timerState.isRunning) {
          await stopInteraction();
        }
        return "Task handled";
      }
    },
    onConnect: () => {
      setState(prev => ({ ...prev, status: 'connected' }));
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      setState(initialState);
      setTimerState(initialTimerState);
      toast({
        title: "Disconnected",
        description: "Voice connection closed"
      });
    },
    onError: (error) => {
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
    try {
      setState(prev => ({ ...prev, status: 'connecting' }));
      
      const conversationId = await conversation.startSession({
        agentId: PUBLIC_AGENT_ID,
        dynamicVariables: {
          personality: personalityData?.finalPersonality || 'default'
        }
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
  }, [conversation, personalityData]);

  const stopInteraction = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'disconnecting' }));
      await conversation.endSession();
      setState(initialState);
      setTimerState(initialTimerState);
    } catch (error) {
      sessionLogger.error('Failed to stop voice interaction', error);
      setState(prev => ({ ...prev, status: 'error' }));
      throw error;
    }
  }, [conversation]);

  return {
    ...state,
    startInteraction,
    stopInteraction,
    timerState
  };
};
