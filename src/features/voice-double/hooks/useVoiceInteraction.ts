
import { useConversation } from '@11labs/react';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { VoiceConfig } from '../types';

export const useVoiceInteraction = (config?: VoiceConfig) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const { toast } = useToast();
  
  const conversation = useConversation({
    onConnect: () => {
      setStatus('connected');
      toast({
        title: "Connected",
        description: "Voice interaction is ready",
      });
    },
    onDisconnect: () => {
      setStatus('idle');
    },
    onError: (error) => {
      setStatus('error');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    overrides: {
      agent: {
        language: "en",
      },
      tts: {
        optimize_streaming_latency: 0
      },
      asr: {
        provider: "elevenlabs",
        quality: "high",
        user_input_audio_format: "pcm_16000"
      },
      turn: {
        mode: "manual",
        turn_timeout: 15,
        min_duration: 2
      }
    }
  });

  const handleInteractionToggle = useCallback(async () => {
    try {
      if (status === 'idle') {
        setStatus('connecting');
        await conversation.startSession({ 
          agentId: "TGp0ve1q0XQurppvTzrO"
        });
      } else if (status === 'connected') {
        await conversation.endSession();
        setStatus('idle');
      }
    } catch (error) {
      setStatus('error');
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect",
        variant: "destructive",
      });
    }
  }, [status, conversation, toast]);

  return {
    status,
    handleInteractionToggle,
    isSpeaking: conversation.isSpeaking,
  };
};
