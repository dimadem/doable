
import { useReducer, useRef, useCallback, useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';
import { TimerState } from '../types/voice';
import { voiceReducer, initialVoiceState } from './voice/voiceReducer';
import { createClientTools } from './voice/clientTools';
import { useConversationManager } from './voice/useConversationManager';
import { PUBLIC_AGENT_ID } from '../constants/voice';

const CONNECT_TIMEOUT = 5000;
const DEBOUNCE_DELAY = 300;

export const initialTimerState: TimerState = {
  isRunning: false,
  remainingTime: 0,
  duration: 0,
};

export const useVoiceState = () => {
  const { personalityData } = useSession();
  const [state, dispatch] = useReducer(voiceReducer, initialVoiceState);
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState);
  
  const conversationRef = useRef<ReturnType<typeof import('@11labs/react').useConversation>>();
  const connectTimeoutRef = useRef<NodeJS.Timeout>();
  const lastAttemptRef = useRef<number>(0);
  const isConnectingRef = useRef(false);
  const unmountingRef = useRef(false);

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

  const clientTools = createClientTools(setTimerState, stopInteraction, unmountingRef);
  const conversation = useConversationManager({
    dispatch,
    clientTools,
    unmountingRef,
    conversationRef,
  });

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
      
      await conversation.startSession({
        agentId: PUBLIC_AGENT_ID,
        dynamicVariables: {
          personality: personalityData?.finalPersonality || 'default',
          end_conversation: false,
          timer_active: false,
          timer_duration: 0
        }
      });

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

  return {
    state,
    timerState,
    actions: {
      startInteraction,
      stopInteraction
    }
  };
};
