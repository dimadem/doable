
import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';

export const useVoiceInteraction = () => {
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const conversation = useConversation({
    onConnect: () => {
      sessionLogger.info('Voice interaction connected');
    },
    onDisconnect: () => {
      sessionLogger.info('Voice interaction disconnected');
    },
    onError: (error) => {
      sessionLogger.error('Voice interaction error', error);
    },
    onMessage: (message) => {
      sessionLogger.info('Voice interaction message received', message);
    }
  });

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      return true;
    } catch (error) {
      sessionLogger.error('Microphone permission denied', error);
      return false;
    }
  }, []);

  const startInteraction = useCallback(async () => {
    try {
      if (!hasMicPermission) {
        const granted = await requestMicrophonePermission();
        if (!granted) {
          throw new Error('Microphone permission is required');
        }
      }

      sessionLogger.info('Starting voice interaction');
      const conversationId = await conversation.startSession({
        agentId: "agent_1", // Replace with your actual agent ID
      });
      
      sessionLogger.info('Voice interaction started', { conversationId });
      return conversationId;
    } catch (error) {
      sessionLogger.error('Failed to start voice interaction', error);
      throw error;
    }
  }, [conversation, hasMicPermission, requestMicrophonePermission]);

  const stopInteraction = useCallback(async () => {
    try {
      sessionLogger.info('Stopping voice interaction');
      await conversation.endSession();
    } catch (error) {
      sessionLogger.error('Failed to stop voice interaction', error);
      throw error;
    }
  }, [conversation]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
    } catch (error) {
      sessionLogger.error('Failed to set volume', error);
      throw error;
    }
  }, [conversation]);

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    hasMicPermission,
    requestMicrophonePermission,
    startInteraction,
    stopInteraction,
    setVolume
  };
};
