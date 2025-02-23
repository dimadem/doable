
import React from 'react';
import { useConversation } from '@11labs/react';
import { useToast } from '@/hooks/use-toast';
import type { StatusIndicatorProps, VoiceConfig } from '../types';

export const useVoiceInteraction = (voiceConfig: VoiceConfig | undefined) => {
  const { toast } = useToast();
  const [status, setStatus] = React.useState<StatusIndicatorProps['status']>('idle');

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice connection established');
      setStatus('connected');
    },
    onDisconnect: () => {
      console.log('Voice connection disconnected');
      setStatus('idle');
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect to voice service",
      });
      setStatus('idle');
    }
  });

  const handleInteractionToggle = async () => {
    if (status === 'idle') {
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
        setStatus('connecting');
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
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to start voice interaction",
        });
        setStatus('idle');
      }
    } else {
      console.log('Ending voice session');
      await conversation.endSession();
      setStatus('idle');
    }
  };

  return {
    status,
    handleInteractionToggle
  };
};
