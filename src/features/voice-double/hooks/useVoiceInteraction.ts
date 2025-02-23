
import { useConversation } from '@11labs/react';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  type: 'transcription' | 'response';
  content: string;
  final?: boolean;
}

export const useVoiceInteraction = () => {
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      toast({
        title: "Connected",
        description: "Voice interaction is ready",
      });
    },
    onDisconnect: () => {
      setConversationId(null);
      toast({
        title: "Disconnected",
        description: "Voice interaction ended",
      });
    },
    onMessage: (message) => {
      setMessages(prev => [...prev, {
        type: message.type === 'transcription' ? 'transcription' : 'response',
        content: message.content,
        final: message.final
      }]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const requestMicPermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      return true;
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const startConversation = useCallback(async () => {
    try {
      if (!hasMicPermission) {
        const granted = await requestMicPermission();
        if (!granted) return;
      }

      const id = await conversation.startSession({
        agentId: "TGp0ve1q0XQurppvTzrO"
      });
      
      setConversationId(id);
      setMessages([]);
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect",
        variant: "destructive",
      });
    }
  }, [hasMicPermission, requestMicPermission, conversation, toast]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end conversation",
        variant: "destructive",
      });
    }
  }, [conversation, toast]);

  const setVolume = useCallback((volume: number) => {
    conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
  }, [conversation]);

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    messages,
    conversationId,
    hasMicPermission,
    start: startConversation,
    stop: stopConversation,
    requestMicPermission,
    setVolume
  };
};
