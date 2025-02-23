
import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSupabase } from '@/integrations/supabase/client'; // Add this import

export const useVoiceInteraction = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const supabase = useSupabase();
  
  const conversation = useConversation({
    onConnect: () => {
      sessionLogger.info('Voice interaction connected');
    },
    onDisconnect: () => {
      sessionLogger.info('Voice interaction disconnected');
      setConversationId(null);
    },
    onError: (error) => {
      sessionLogger.error('Voice interaction error', error);
      setConversationId(null);
    },
    onMessage: (message) => {
      sessionLogger.info('Voice interaction message', message);
    }
  });

  const startInteraction = useCallback(async () => {
    try {
      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get the agent ID from Supabase
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'ELEVENLABS_AGENT_ID')
        .single();

      if (secretError || !secretData) {
        throw new Error('Failed to retrieve agent ID');
      }

      // Start the conversation session with the agent ID
      const newConversationId = await conversation.startSession({
        agentId: secretData.value
      });
      
      setConversationId(newConversationId);
      sessionLogger.info('Started conversation', { conversationId: newConversationId });
      
      return newConversationId;
    } catch (error) {
      sessionLogger.error('Failed to start conversation', error);
      throw error;
    }
  }, [conversation, supabase]);

  const stopInteraction = useCallback(async () => {
    try {
      if (conversationId) {
        await conversation.endSession();
        sessionLogger.info('Ended conversation', { conversationId });
        setConversationId(null);
      }
    } catch (error) {
      sessionLogger.error('Failed to end conversation', error);
      throw error;
    }
  }, [conversation, conversationId]);

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    conversationId,
    startInteraction,
    stopInteraction,
  };
};
