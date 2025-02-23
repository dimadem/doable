
import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';

// Public agent ID - no auth needed
const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';

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
      
      // Start the conversation session with the public agent ID
      const newConversationId = await conversation.startSession({
        agentId: PUBLIC_AGENT_ID
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
