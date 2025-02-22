
import { useState, useCallback, useEffect, useRef } from 'react';
import type { StatusIndicatorProps } from '../types';
import type { Json } from '@/integrations/supabase/types';
import { AudioQueue } from '../services/audioService';
import { toast } from '@/components/ui/use-toast';

interface VoiceConfig {
  voice_name?: string;
  api_key?: string;
  agent_id?: string;
  agent_settings?: Json;
}

const RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000;

export const useVoiceInteraction = (voiceConfig?: VoiceConfig | null) => {
  const [status, setStatus] = useState<StatusIndicatorProps['status']>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Initialize audio queue
  useEffect(() => {
    audioQueueRef.current = new AudioQueue();
    return () => {
      audioQueueRef.current?.dispose();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecording(false);
    setStatus('idle');
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;
      setIsRecording(true);
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Unable to access your microphone. Please check your permissions.",
      });
      throw new Error('Unable to access microphone');
    }
  }, []);

  const connectWebSocket = useCallback(async () => {
    if (!voiceConfig?.agent_id || !voiceConfig?.api_key) {
      throw new Error('Voice agent not configured');
    }

    const ws = new WebSocket(`wss://api.elevenlabs.io/v1/chat?agent_id=${voiceConfig.agent_id}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected, sending auth...');
      ws.send(JSON.stringify({
        type: 'connection.auth',
        api_key: voiceConfig.api_key
      }));
      setStatus('processing');
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'speech') {
          setStatus('responding');
          audioQueueRef.current?.addToQueue(data.audio);
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (reconnectAttemptsRef.current < RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, RECONNECT_DELAY);
      } else {
        cleanup();
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to connect to voice service. Please try again.",
        });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      cleanup();
    };

    webSocketRef.current = ws;
  }, [voiceConfig, cleanup]);

  const startVoiceInteraction = useCallback(async () => {
    try {
      setStatus('connecting');
      await startRecording();
      await connectWebSocket();
    } catch (err) {
      console.error('Voice interaction error:', err);
      cleanup();
      throw err;
    }
  }, [startRecording, connectWebSocket, cleanup]);

  const stopVoiceInteraction = useCallback(() => {
    cleanup();
    audioQueueRef.current?.clear();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      audioQueueRef.current?.dispose();
    };
  }, [cleanup]);

  return {
    status,
    isRecording,
    startVoiceInteraction,
    stopVoiceInteraction
  };
};
