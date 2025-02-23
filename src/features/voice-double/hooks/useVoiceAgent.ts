
import { useState, useEffect, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';
import { PUBLIC_AGENT_ID } from '../constants/voice';

type VoiceStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface VoiceState {
  status: VoiceStatus;
  isSpeaking: boolean;
  error?: Error;
}

export const useVoiceAgent = () => {
  const [state, setState] = useState<VoiceState>({
    status: 'idle',
    isSpeaking: false
  });

  const handleConnect = useCallback(() => {
    console.log('Connected to voice agent');
    setState(prev => ({ ...prev, status: 'connected' }));
    toast({
      title: "Connected",
      description: "Voice connection established"
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('Disconnected from voice agent');
    setState(prev => ({ ...prev, status: 'idle', isSpeaking: false }));
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Voice agent error:', error);
    setState(prev => ({ ...prev, status: 'error', error }));
    toast({
      variant: "destructive",
      title: "Connection Error",
      description: "Failed to establish voice connection"
    });
  }, []);

  const conversation = useConversation({
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError
  });

  useEffect(() => {
    return () => {
      if (state.status === 'connected') {
        conversation.endSession().catch(console.error);
      }
    };
  }, [conversation, state.status]);

  const connect = async () => {
    try {
      setState(prev => ({ ...prev, status: 'connecting' }));
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation session
      await conversation.startSession({
        agentId: PUBLIC_AGENT_ID
      });
    } catch (error) {
      setState(prev => ({ ...prev, status: 'error', error: error as Error }));
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          variant: "destructive",
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice features."
        });
      }
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      setState(prev => ({ ...prev, status: 'idle' }));
      await conversation.endSession();
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  };

  return {
    status: state.status,
    isSpeaking: state.isSpeaking,
    error: state.error,
    connect,
    disconnect
  };
};
