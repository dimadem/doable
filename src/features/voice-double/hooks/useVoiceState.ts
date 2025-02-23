
import { useState, useCallback, useRef, useEffect, useReducer, useMemo } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../constants/voice';
import { VoiceState, TimerState, VoiceContextType, VoiceAction } from '../types/voice';
import { useSession } from '@/contexts/SessionContext';

const CONNECTION_TIMEOUT = 5000;
const DEBOUNCE_DELAY = 300;

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

function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'START_CONNECTING':
      return { ...state, status: 'connecting' };
    case 'CONNECTION_ESTABLISHED':
      return { 
        ...state, 
        status: 'connected',
        conversationId: action.conversationId 
      };
    case 'START_DISCONNECTING':
      return { ...state, status: 'disconnecting' };
    case 'CONNECTION_CLOSED':
      return initialState;
    case 'CONNECTION_ERROR':
      return { ...state, status: 'error' };
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.isSpeaking };
    default:
      return state;
  }
}

export const useVoiceState = (): VoiceContextType => {
  const { personalityData } = useSession();
  const [state, dispatch] = useReducer(voiceReducer, initialState);
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState);
  
  const conversationRef = useRef<ReturnType<typeof useConversation>>();
  const unmountingRef = useRef(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastConnectionAttemptRef = useRef<number>(0);
  
  const conversation = useConversation({
    clientTools: {
      set_timer_state: async ({ timer_on }) => {
        if (!unmountingRef.current) {
          setTimerState(prev => ({ ...prev, isRunning: timer_on }));
        }
        return "Timer state updated";
      },
      set_timer_duration: async ({ timer_duration }) => {
        if (!unmountingRef.current) {
          const durationInSeconds = timer_duration * 60;
          setTimerState(prev => ({
            ...prev,
            duration: timer_duration,
            remainingTime: durationInSeconds
          }));
        }
        return "Timer duration set";
      },
      set_task: async ({ task_description, end_conversation = false }) => {
        sessionLogger.info('Task update received', { task_description, end_conversation });
        
        if (end_conversation && !timerState.isRunning && !unmountingRef.current) {
          await stopInteraction();
          return "Task completed and conversation ended";
        }
        return "Task handled";
      }
    },
    onConnect: () => {
      if (!unmountingRef.current) {
        console.log('WebSocket connected');
        dispatch({ type: 'CONNECTION_ESTABLISHED', conversationId: state.conversationId || '' });
        clearTimeout(connectionTimeoutRef.current);
        toast({
          title: "Connected",
          description: "Voice connection established"
        });
      }
    },
    onDisconnect: () => {
      if (!unmountingRef.current) {
        console.log('WebSocket disconnected');
        dispatch({ type: 'CONNECTION_CLOSED' });
        setTimerState(initialTimerState);
      }
    },
    onError: (error) => {
      if (!unmountingRef.current) {
        console.error('WebSocket error:', error);
        dispatch({ type: 'CONNECTION_ERROR' });
        sessionLogger.error('Voice connection error', error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to establish voice connection"
        });
      }
    }
  });

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    unmountingRef.current = false;
    return () => {
      unmountingRef.current = true;
      clearTimeout(connectionTimeoutRef.current);
    };
  }, []);

  const startInteraction = useCallback(async () => {
    if (unmountingRef.current) return;
    
    const now = Date.now();
    if (now - lastConnectionAttemptRef.current < DEBOUNCE_DELAY) {
      console.log('Debouncing connection attempt');
      return;
    }
    
    lastConnectionAttemptRef.current = now;
    console.log('Starting interaction, current status:', state.status);

    try {
      dispatch({ type: 'START_CONNECTING' });
      
      console.log('Requesting microphone permission...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      connectionTimeoutRef.current = setTimeout(() => {
        if (!unmountingRef.current && state.status === 'connecting') {
          dispatch({ type: 'CONNECTION_ERROR' });
          toast({
            variant: "destructive",
            title: "Connection Timeout",
            description: "Failed to establish voice connection"
          });
        }
      }, CONNECTION_TIMEOUT);
      
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

      if (!unmountingRef.current) {
        console.log('Session started, updating state with conversationId:', conversationId);
        dispatch({ type: 'CONNECTION_ESTABLISHED', conversationId });
      }
    } catch (error) {
      if (!unmountingRef.current) {
        console.error('Failed to start interaction:', error);
        dispatch({ type: 'CONNECTION_ERROR' });
        sessionLogger.error('Failed to start voice interaction', error);
        
        if (error instanceof Error) {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: error.message || "Failed to establish voice connection"
          });
        }
      }
      throw error;
    }
  }, [conversation, personalityData, state.status]);

  const stopInteraction = useCallback(async () => {
    if (unmountingRef.current) return;
    
    console.log('Stopping interaction, current status:', state.status);
    if (state.status === 'idle') return;

    try {
      dispatch({ type: 'START_DISCONNECTING' });
      
      if (timerState.isRunning) {
        setTimerState(prev => ({ ...prev, isRunning: false }));
      }

      if (conversationRef.current) {
        console.log('Ending conversation session...');
        await conversationRef.current.endSession();
      }
    } catch (error) {
      if (!unmountingRef.current) {
        console.error('Failed to stop interaction:', error);
        dispatch({ type: 'CONNECTION_ERROR' });
        sessionLogger.error('Failed to stop voice interaction', error);
      }
      throw error;
    }
  }, [state.status, timerState.isRunning]);

  useEffect(() => {
    return () => {
      if (state.status !== 'idle') {
        stopInteraction().catch(console.error);
      }
    };
  }, []);

  const stableContextValue = useMemo(() => ({
    ...state,
    startInteraction,
    stopInteraction,
    timerState
  }), [state, startInteraction, stopInteraction, timerState]);

  return stableContextValue;
};
