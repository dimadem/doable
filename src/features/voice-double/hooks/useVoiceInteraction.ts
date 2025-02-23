
import React from 'react';
import { useConversation } from '@11labs/react';
import { useToast } from '@/hooks/use-toast';
import type { StatusIndicatorProps, VoiceConfig } from '../types';

const RETRY_DELAY = 1000; // 1 second delay between retries
const MAX_RETRIES = 3;

export const useVoiceInteraction = (voiceConfig: VoiceConfig | undefined) => {
  const { toast } = useToast();
  const [status, setStatus] = React.useState<StatusIndicatorProps['status']>('idle');
  const [retryCount, setRetryCount] = React.useState(0);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice connection established');
      setStatus('connected');
      setRetryCount(0);
    },
    onDisconnect: () => {
      console.log('Voice connection disconnected');
      // Only set to idle if we explicitly ended the session
      if (status !== 'connecting') {
        setStatus('idle');
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      handleConnectionError(error);
    }
  });

  const handleConnectionError = React.useCallback(async (error: Error) => {
    console.error('Connection error:', error);
    
    if (retryCount < MAX_RETRIES && status === 'connecting') {
      console.log(`Retrying connection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      setRetryCount(prev => prev + 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      startVoiceSession();
    } else {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect to voice service",
      });
      setStatus('idle');
      setRetryCount(0);
    }
  }, [retryCount, status, toast]);

  const checkMicrophonePermission = React.useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast({
        variant: "destructive",
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice features",
      });
      return false;
    }
  }, [toast]);

  const startVoiceSession = React.useCallback(async () => {
    if (!voiceConfig?.api_key || !voiceConfig?.agent_id || !voiceConfig?.agent_settings?.tts?.voice_id) {
      console.error('Missing voice configuration:', {
        hasApiKey: !!voiceConfig?.api_key,
        hasAgentId: !!voiceConfig?.agent_id,
        hasVoiceId: !!voiceConfig?.agent_settings?.tts?.voice_id
      });
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Voice service not configured properly",
      });
      return;
    }

    try {
      console.log('Starting voice session with:', {
        agentId: voiceConfig.agent_id,
        voiceId: voiceConfig.agent_settings.tts.voice_id
      });

      await conversation.startSession({
        agentId: voiceConfig.agent_id,
        overrides: {
          tts: {
            voiceId: voiceConfig.agent_settings.tts.voice_id
          }
        }
      });
    } catch (err) {
      console.error('Voice interaction error:', err);
      handleConnectionError(err instanceof Error ? err : new Error('Failed to start voice interaction'));
    }
  }, [voiceConfig, conversation, toast, handleConnectionError]);

  const handleInteractionToggle = React.useCallback(async () => {
    if (status === 'idle') {
      const hasMicPermission = await checkMicrophonePermission();
      if (!hasMicPermission) {
        return;
      }

      setStatus('connecting');
      startVoiceSession();
    } else {
      console.log('Ending voice session');
      await conversation.endSession();
      setStatus('idle');
      setRetryCount(0);
    }
  }, [status, checkMicrophonePermission, startVoiceSession, conversation]);

  return {
    status,
    handleInteractionToggle
  };
};
