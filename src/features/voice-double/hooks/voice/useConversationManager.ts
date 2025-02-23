
import { useEffect, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../../constants/voice';
import { VoiceAction } from '../../types/voice';

interface UseConversationManagerProps {
  dispatch: React.Dispatch<VoiceAction>;
  clientTools: ReturnType<typeof import('./clientTools').createClientTools>;
  unmountingRef: React.RefObject<boolean>;
  conversationRef: React.MutableRefObject<ReturnType<typeof useConversation> | undefined>;
  clearConnectionTimeout: () => void;
}

export const useConversationManager = ({
  dispatch,
  clientTools,
  unmountingRef,
  conversationRef,
  clearConnectionTimeout,
}: UseConversationManagerProps) => {
  const handleConnect = useCallback(() => {
    if (unmountingRef.current) return;
    
    console.log('WebSocket connected');
    clearConnectionTimeout();
    dispatch({ type: 'CONNECTION_SUCCESS', conversationId: PUBLIC_AGENT_ID });
    
    toast({
      title: "Connected",
      description: "Voice connection established"
    });
  }, [dispatch, unmountingRef, clearConnectionTimeout]);

  const handleDisconnect = useCallback(() => {
    if (unmountingRef.current) return;
    
    console.log('WebSocket disconnected');
    dispatch({ type: 'DISCONNECTED' });
  }, [dispatch, unmountingRef]);

  const handleError = useCallback((error: Error) => {
    if (unmountingRef.current) return;
    
    console.error('WebSocket error:', error);
    clearConnectionTimeout();
    dispatch({ type: 'CONNECTION_FAILED', error });
    
    toast({
      variant: "destructive",
      title: "Connection Error",
      description: "Failed to establish voice connection"
    });
  }, [dispatch, unmountingRef, clearConnectionTimeout]);

  const conversation = useConversation({
    clientTools,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError
  });

  // Immediately set the conversation reference when it's created
  useEffect(() => {
    conversationRef.current = conversation;
    
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession().catch(console.error);
      }
    };
  }, [conversation, conversationRef]);

  return conversation;
};
