
import { useReducer, useRef, useCallback, useEffect, useMemo } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../constants/voice';
import { VoiceState, TimerState, VoiceAction } from '../types/voice';
import { useSession } from '@/contexts/SessionContext';

const CONNECT_TIMEOUT = 5000;
const DEBOUNCE_DELAY = 300;

const initialState: VoiceState = {
  status: 'idle',
  isSpeaking: false,
  conversationId: null,
  canEndConversation: false,
};

const initialTimerState: TimerState = {
  isRunning: false,
  remainingTime: 0,
  duration: 0,
};

function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'INIT_CONNECTION':
      return { ...state, status: 'connecting', error: undefined };
    case 'CONNECTION_SUCCESS':
      return { 
        ...state, 
        status: 'connected',
        conversationId: action.conversationId,
        error: undefined
      };
    case 'CONNECTION_FAILED':
      return { 
        ...state, 
        status: 'error',
        error: action.error
      };
    case 'BEGIN_DISCONNECT':
      return { ...state, status: 'disconnecting' };
    case 'DISCONNECTED':
      return initialState;
    case 'UPDATE_SPEAKING':
      return { ...state, isSpeaking: action.isSpeaking };
    case 'ALLOW_END_CONVERSATION':
      return { ...state, canEndConversation: true };
    default:
      return state;
  }
}

export const useVoiceState = () => {
  const { personalityData } = useSession();
  const [state, dispatch] = useReducer(voiceReducer, initialState);
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState);
  
  // Refs for managing connection state
  const conversationRef = useRef<ReturnType<typeof useConversation>>();
  const connectTimeoutRef = useRef<NodeJS.Timeout>();
  const lastAttemptRef = useRef<number>(0);
  const isConnectingRef = useRef(false);
  const unmountingRef = useRef(false);
  
  // Initialize conversation with client tools
  const conversation = useConversation({
    clientTools: {
      set_timer_state: async ({ timer_on }) => {
        if (unmountingRef.current) return;
        
        console.log('Setting timer state:', timer_on);
        setTimerState(prev => ({ ...prev, isRunning: timer_on }));
        return "Timer state updated";
      },
      set_timer_duration: async ({ timer_duration }) => {
        if (unmountingRef.current) return;
        
        console.log('Setting timer duration:', timer_duration);
        const durationInSeconds = timer_duration * 60;
        setTimerState(prev => ({
          ...prev,
          duration: timer_duration,
          remainingTime: durationInSeconds
        }));
        return "Timer duration set";
      },
      set_task: async ({ end_conversation = false }) => {
        if (unmountingRef.current) return;
        
        if (end_conversation && timerState.isRunning) {
          dispatch({ type: 'ALLOW_END_CONVERSATION' });
          await stopInteraction();
          return "Task completed and conversation ended";
        }
        
        return "Task handled";
      }
    },
    onConnect: () => {
      if (unmountingRef.current) return;
      
      console.log('WebSocket connected');
      clearTimeout(connectTimeoutRef.current);
      isConnectingRef.current = false;
      
      dispatch({ type: 'CONNECTION_SUCCESS', conversationId: state.conversationId || '' });
      
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      if (unmountingRef.current) return;
      
      console.log('WebSocket disconnected');
      dispatch({ type: 'DISCONNECTED' });
      setTimerState(initialTimerState);
    },
    onError: (error) => {
      if (unmountingRef.current) return;
      
      console.error('WebSocket error:', error);
      dispatch({ type: 'CONNECTION_FAILED', error });
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish voice connection"
      });
    }
  });

  useEffect(() => {
    conversationRef.current = conversation;
    return () => {
      unmountingRef.current = true;
      clearTimeout(connectTimeoutRef.current);
      
      if (conversationRef.current && state.status !== 'idle') {
        conversationRef.current.endSession().catch(console.error);
      }
    };
  }, []);

  const startInteraction = useCallback(async () => {
    if (unmountingRef.current || isConnectingRef.current) {
      console.log('Preventing start - component unmounting or already connecting');
      return;
    }
    
    const now = Date.now();
    if (now - lastAttemptRef.current < DEBOUNCE_DELAY) {
      console.log('Debouncing connection attempt');
      return;
    }
    
    lastAttemptRef.current = now;
    isConnectingRef.current = true;
    
    try {
      dispatch({ type: 'INIT_CONNECTION' });
      
      console.log('Requesting microphone permission...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (unmountingRef.current) return;
      
      connectTimeoutRef.current = setTimeout(() => {
        if (!unmountingRef.current && isConnectingRef.current) {
          isConnectingRef.current = false;
          dispatch({ type: 'CONNECTION_FAILED' });
          toast({
            variant: "destructive",
            title: "Connection Timeout",
            description: "Failed to establish voice connection"
          });
        }
      }, CONNECT_TIMEOUT);
      
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
        dispatch({ type: 'CONNECTION_SUCCESS', conversationId });
      }
    } catch (error) {
      if (!unmountingRef.current) {
        isConnectingRef.current = false;
        dispatch({ type: 'CONNECTION_FAILED', error: error as Error });
        
        if (error instanceof Error && error.name === 'NotAllowedError') {
          toast({
            variant: "destructive",
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice features."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Failed to establish voice connection"
          });
        }
      }
      throw error;
    }
  }, [conversation, personalityData]);

  const stopInteraction = useCallback(async () => {
    if (unmountingRef.current) return;
    
    try {
      dispatch({ type: 'BEGIN_DISCONNECT' });
      
      if (timerState.isRunning) {
        setTimerState(prev => ({ ...prev, isRunning: false }));
      }

      if (conversationRef.current) {
        await conversationRef.current.endSession();
      }
      
      dispatch({ type: 'DISCONNECTED' });
    } catch (error) {
      console.error('Failed to stop interaction:', error);
      dispatch({ type: 'CONNECTION_FAILED', error: error as Error });
    }
  }, [timerState.isRunning]);

  const contextValue = useMemo(() => ({
    state,
    timerState,
    actions: {
      startInteraction,
      stopInteraction
    }
  }), [state, timerState, startInteraction, stopInteraction]);

  return contextValue;
};
