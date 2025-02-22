
import { useState, useCallback, useEffect, useRef } from 'react';
import type { StatusIndicatorProps } from '../types';
import type { Json } from '@/integrations/supabase/types';
import { AudioQueue } from '../services/audioService';
import { VoiceConnectionManager } from '../services/VoiceConnectionManager';
import { toast } from '@/components/ui/use-toast';

interface VoiceConfig {
  voice_name?: string;
  api_key?: string;
  agent_id?: string;
  agent_settings?: Json;
}

export const useVoiceInteraction = (voiceConfig?: VoiceConfig | null) => {
  const [status, setStatus] = useState<StatusIndicatorProps['status']>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [errorDetails, setErrorDetails] = useState<Error | null>(null);
  
  const connectionManagerRef = useRef<VoiceConnectionManager | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  useEffect(() => {
    audioQueueRef.current = new AudioQueue();
    return () => {
      audioQueueRef.current?.dispose();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (connectionManagerRef.current) {
      connectionManagerRef.current.disconnect();
      connectionManagerRef.current = null;
    }
    setIsRecording(false);
    setStatus('idle');
    setConnectionStatus('disconnected');
    setErrorDetails(null);
  }, []);

  const startVoiceInteraction = useCallback(async () => {
    if (!voiceConfig?.agent_id || !voiceConfig?.api_key) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Voice agent not configured",
      });
      return;
    }

    try {
      cleanup();
      setStatus('connecting');
      setConnectionStatus('connecting');

      const connectionManager = new VoiceConnectionManager({
        agentId: voiceConfig.agent_id,
        apiKey: voiceConfig.api_key,
        voiceId: voiceConfig.voice_name,
        debug: true
      });

      connectionManager.on('connected', () => {
        setStatus('processing');
        setConnectionStatus('connected');
        setIsRecording(true);
      });

      connectionManager.on('disconnected', (event) => {
        console.log('Disconnected:', event);
        cleanup();
      });

      connectionManager.on('error', (error) => {
        console.error('Connection error:', error);
        setErrorDetails(error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error.message || "Failed to connect to voice service",
        });
        cleanup();
      });

      connectionManager.on('audioData', (audioData) => {
        setStatus('responding');
        audioQueueRef.current?.addToQueue(audioData);
      });

      connectionManagerRef.current = connectionManager;
      await connectionManager.connect();

    } catch (err) {
      console.error('Voice interaction error:', err);
      cleanup();
      throw err;
    }
  }, [voiceConfig, cleanup]);

  const stopVoiceInteraction = useCallback(() => {
    cleanup();
    audioQueueRef.current?.clear();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
      audioQueueRef.current?.dispose();
    };
  }, [cleanup]);

  return {
    status,
    isRecording,
    connectionStatus,
    errorDetails,
    startVoiceInteraction,
    stopVoiceInteraction
  };
};
