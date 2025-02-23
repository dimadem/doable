
import { useState, useCallback, useRef, useEffect } from 'react';
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
  const conversationRef = useRef<ReturnType<typeof useConversation>>();
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
        if (end_conversation && !timerState.isRunning) {
          await stopInteraction();
        }
        return "Task handled";
      }
    },
    onConnect: () => {
      console.log('WebSocket connected');
      isConnectingRef.current = false;
      setState(prev => ({ ...prev, status: 'connected' }));
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
      isConnectingRef.current = false;
      isDisconnectingRef.current = false;
      setState(initialState);
      setTimerState(initialTimerState);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
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

  // Store conversation instance in ref to ensure consistency
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  const startInteraction = useCallback(async () => {
    console.log('Starting interaction, current status:', state.status);
    if (isConnectingRef.current || state.status === 'connected') {
      console.log('Already connecting or connected, skipping');
      return;
    }

    try {
      isConnectingRef.current = true;
      setState(prev => ({ ...prev, status: 'connecting' }));
      
      console.log('Requesting microphone permission...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('Starting conversation session...');
      const conversationId = await conversation.startSession({
        agentId: PUBLIC_AGENT_ID,
        dynamicVariables: {
          personality: personalityData?.finalPersonality || 'default',
          end_conversation: false,
          timer_active: false,
          timer_duration: 0
        }
      });

      console.log('Session started, updating state with conversationId:', conversationId);
      setState(prev => ({ 
        ...prev,
        conversationId 
      }));
    } catch (error) {
      console.error('Failed to start interaction:', error);
      isConnectingRef.current = false;
      setState(prev => ({ ...prev, status: 'error' }));
      sessionLogger.error('Failed to start voice interaction', error);
      
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error.message || "Failed to establish voice connection"
        });
      }
      throw error;
    }
  }, [conversation, personalityData, state.status]);

  const stopInteraction = useCallback(async () => {
    console.log('Stopping interaction, current status:', state.status);
    if (isDisconnectingRef.current || state.status === 'idle') {
      console.log('Already disconnecting or idle, skipping');
      return;
    }

    try {
      isDisconnectingRef.current = true;
      setState(prev => ({ ...prev, status: 'disconnecting' }));
      
      if (timerState.isRunning) {
        setTimerState(prev => ({ ...prev, isRunning: false }));
      }
      
      if (conversationRef.current) {
        console.log('Ending conversation session...');
        await conversationRef.current.endSession();
      }
    } catch (error) {
      console.error('Failed to stop interaction:', error);
      isDisconnectingRef.current = false;
      setState(prev => ({ ...prev, status: 'error' }));
      sessionLogger.error('Failed to stop voice interaction', error);
      throw error;
    }
  }, [state.status, timerState.isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.status !== 'idle') {
        stopInteraction().catch(console.error);
      }
    };
  }, [stopInteraction, state.status]);

  return {
    ...state,
    startInteraction,
    stopInteraction,
    timerState
  };
};
