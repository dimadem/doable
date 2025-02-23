
import { useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../../constants/voice';
import { VoiceAction } from '../../types/voice';

interface UseConversationManagerProps {
  dispatch: React.Dispatch<VoiceAction>;
  clientTools: ReturnType<typeof import('./clientTools').createClientTools>;
  unmountingRef: React.RefObject<boolean>;
  conversationRef: React.MutableRefObject<ReturnType<typeof useConversation> | undefined>;
}

export const useConversationManager = ({
  dispatch,
  clientTools,
  unmountingRef,
  conversationRef,
}: UseConversationManagerProps) => {
  const conversation = useConversation({
    clientTools,
    onConnect: () => {
      if (unmountingRef.current) return;
      
      console.log('WebSocket connected');
      dispatch({ type: 'CONNECTION_SUCCESS', conversationId: '' });
      
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      if (unmountingRef.current) return;
      
      console.log('WebSocket disconnected');
      dispatch({ type: 'DISCONNECTED' });
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
  }, [conversation, conversationRef]);

  return conversation;
};
