
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
const CONNECTION_TIMEOUT = 10000;

export const useVoiceInteraction = (voiceConfig?: VoiceConfig | null) => {
  const [status, setStatus] = useState<StatusIndicatorProps['status']>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioQueueRef.current = new AudioQueue();
    return () => {
      audioQueueRef.current?.dispose();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

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
          sampleRate: 16000,
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

  const buildWebSocketUrl = useCallback((agentId: string) => {
    return `wss://api.elevenlabs.io/v1/text-to-speech/stream`;
  }, []);

  const connectWebSocket = useCallback(async () => {
    if (!voiceConfig?.agent_id || !voiceConfig?.api_key) {
      throw new Error('Voice agent not configured');
    }

    cleanup();

    // Create WebSocket with custom headers
    const ws = new WebSocket(buildWebSocketUrl(voiceConfig.agent_id));
    webSocketRef.current = ws;

    connectionTimeoutRef.current = setTimeout(() => {
      console.error('WebSocket connection timeout');
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }, CONNECTION_TIMEOUT);

    ws.onopen = () => {
      console.log('WebSocket connected, sending configuration...');
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      // Send initial configuration with authentication
      ws.send(JSON.stringify({
        type: "start",
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        },
        xi_api_key: voiceConfig.api_key,
        voice_id: voiceConfig.voice_name
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
        } else if (data.type === 'error') {
          console.error('Server error:', data.message);
          toast({
            variant: "destructive",
            title: "Server Error",
            description: data.message || "An error occurred with the voice service.",
          });
          cleanup();
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (reconnectAttemptsRef.current < RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
        setTimeout(() => {
          reconnectAttemptsRef.current++;
          console.log(`Attempting reconnection ${reconnectAttemptsRef.current} of ${RECONNECT_ATTEMPTS}`);
          connectWebSocket();
        }, delay);
      } else {
        cleanup();
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to connect to voice service. Please try again.",
        });
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      if (!event.wasClean) {
        console.error('WebSocket connection terminated unexpectedly');
      }
      cleanup();
    };

  }, [voiceConfig, cleanup, buildWebSocketUrl]);

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
