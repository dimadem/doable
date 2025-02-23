
import { useCallback, useState } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';

const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';

export const useVoiceConnection = () => {
  const { sessionData } = useSession();
  
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
    if (!sessionData) {
      throw new Error('No session data available');
    }

    // Request microphone access
    await navigator.mediaDevices.getUserMedia({ audio: true });

    // Start session with dynamic variables
    return await conversation.startSession({
      agentId: PUBLIC_AGENT_ID,
      dynamicVariables: {
        personality: sessionData.personalityData?.finalPersonality || 'default',
        struggle: sessionData.struggleMode || 'default'
      }
    });
  }, [conversation, sessionData]);

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
