
import { useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';

const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';

export const useVoiceConnection = () => {
  const { personalityData, sessionId } = useSession();
  
  // Create conversation instance with basic handlers
  const conversation = useConversation({
    onConnect: () => {
      sessionLogger.info('Voice connection established');
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed');
      toast({
        title: "Disconnected",
        description: "Voice connection closed"
      });
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish voice connection"
      });
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', message);
    }
  });

  const connect = useCallback(async () => {
    try {
      if (!sessionId) {
        throw new Error('No active session');
      }

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start session with dynamic variables
      const conversationId = await conversation.startSession({
        agentId: PUBLIC_AGENT_ID,
        dynamicVariables: {
          personality: personalityData?.finalPersonality || 'default',
          // We don't have struggleMode in the session context, so removing it
          struggle: 'default'
        }
      });

      sessionLogger.info('Voice session started', { conversationId });
      return conversationId;
    } catch (error) {
      sessionLogger.error('Failed to start voice session', error);
      throw error;
    }
  }, [conversation, sessionId, personalityData]);

  const disconnect = useCallback(async () => {
    try {
      await conversation.endSession();
      sessionLogger.info('Voice session ended');
    } catch (error) {
      sessionLogger.error('Failed to end voice session', error);
      throw error;
    }
  }, [conversation]);

  return {
    connect,
    disconnect,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking
  };
};
