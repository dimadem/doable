
import { useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';

const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';

export const useVoiceConnection = () => {
  const { personalityData, sessionId } = useSession();
  
  // Create conversation instance with basic handlers
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
    if (!sessionId) {
      throw new Error('No active session');
    }

    // Request microphone access
    await navigator.mediaDevices.getUserMedia({ audio: true });

    // Start session with dynamic variables
    return await conversation.startSession({
      agentId: PUBLIC_AGENT_ID,
      dynamicVariables: {
        personality: personalityData?.finalPersonality || 'default',
        // We don't have struggleMode in the session context, so removing it
        struggle: 'default'
      }
    });
  }, [conversation, sessionId, personalityData]);

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
