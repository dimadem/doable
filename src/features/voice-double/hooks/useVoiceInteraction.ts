
import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceInteraction = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  
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
      
      // Get the agent ID from the voices table
      const { data: voiceData, error: voiceError } = await supabase
        .from('voices')
        .select('agent_id')
        .maybeSingle();

      if (voiceError || !voiceData?.agent_id) {
        throw new Error('Failed to retrieve agent ID');
      }

      // Start the conversation session with the agent ID
      const newConversationId = await conversation.startSession({
        agentId: voiceData.agent_id
      });
      
      setConversationId(newConversationId);
      sessionLogger.info('Started conversation', { conversationId: newConversationId });
      
      return newConversationId;
    } catch (error) {
      sessionLogger.error('Failed to start conversation', error);
      throw error;
    }
  }, [conversation]);

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
