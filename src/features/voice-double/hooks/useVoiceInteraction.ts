
import { useState, useCallback } from 'react';
import type { StatusIndicatorProps } from '../types';
import type { Json } from '@/integrations/supabase/types';

interface VoiceConfig {
  voice_name?: string;
  api_key?: string | null;
  agent_id?: string;
  agent_settings?: Json;
}

export const useVoiceInteraction = (voiceConfig?: VoiceConfig | null) => {
  const [status, setStatus] = useState<StatusIndicatorProps['status']>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

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
      setAudioStream(stream);
      setIsRecording(true);
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throw new Error('Unable to access microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
      setIsRecording(false);
    }
  }, [audioStream]);

  const startVoiceInteraction = useCallback(async () => {
    if (!voiceConfig?.agent_id || !voiceConfig?.api_key) {
      throw new Error('Voice agent not configured or API key missing');
    }

    try {
      setStatus('connecting');
      await startRecording();
      
      // Initialize WebSocket connection with authentication
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/chat?agent_id=${voiceConfig.agent_id}`);
      
      // Add authentication header
      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({
          type: 'connection.auth',
          api_key: voiceConfig.api_key
        }));
        setStatus('processing');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'speech') {
          setStatus('responding');
          // Handle incoming speech data
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          audio.play();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        stopRecording();
        setStatus('idle');
        throw new Error('WebSocket connection failed');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        stopRecording();
        setStatus('idle');
      };

      return () => {
        ws.close();
        stopRecording();
      };
    } catch (err) {
      console.error('Voice interaction error:', err);
      stopRecording();
      setStatus('idle');
      throw err;
    }
  }, [voiceConfig, startRecording, stopRecording]);

  const stopVoiceInteraction = useCallback(() => {
    stopRecording();
    setStatus('idle');
  }, [stopRecording]);

  return {
    status,
    isRecording,
    startVoiceInteraction,
    stopVoiceInteraction
  };
};
