
import { useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';

const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';

export const useVoiceConnection = () => {
  const conversation = useConversation({
    onConnect: () => {
      sessionLogger.info('Voice connection established');
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed');
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', error);
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', message);
    }
  });

  const connect = useCallback(async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return await conversation.startSession({
      agentId: PUBLIC_AGENT_ID
    });
  }, [conversation]);

  const disconnect = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return {
    connect,
    disconnect,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking
  };
};
