
import { useState, useCallback } from 'react';
import type { StatusIndicatorProps } from '../types';

interface VoiceConfig {
  agent_id?: string;
  agent_settings?: {
    tts?: {
      model_id?: string;
      voice_id?: string;
      stability?: number;
      similarity_boost?: number;
    };
    agent?: {
      prompt?: {
        prompt?: string;
      };
      language?: string;
      first_message?: string;
    };
  };
}

export const useVoiceInteraction = (voiceConfig?: VoiceConfig | null) => {
  const [status, setStatus] = useState<StatusIndicatorProps['status']>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    if (!voiceConfig?.agent_id) {
      throw new Error('Voice agent not configured');
    }

    try {
      setStatus('connecting');
      await startRecording();
      
      // Initialize WebSocket connection for real-time voice interaction
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/chat?agent_id=${voiceConfig.agent_id}`);
      
      ws.onopen = () => {
        setStatus('processing');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'speech') {
          setStatus('responding');
          // Handle incoming speech data
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          audio.play();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        throw new Error('WebSocket connection failed');
      };

      ws.onclose = () => {
        stopRecording();
        setStatus('idle');
      };

      return () => {
        ws.close();
        stopRecording();
      };
    } catch (err) {
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
