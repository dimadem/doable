
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '@/components/layouts/AppHeader';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sessionLogger } from '@/utils/sessionLogger';

const VoiceDouble = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionData, setSessionData] = useState<{ agentId: string; signedUrl: string } | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      sessionLogger.info('Voice connection established');
      setIsConnecting(false);
      setIsActive(true);
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed');
      cleanupAudioResources();
      setIsActive(false);
      setIsConnecting(false);
      setSessionData(null);
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', error);
      cleanupAudioResources();
      setIsActive(false);
      setIsConnecting(false);
      setSessionData(null);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to voice service"
      });
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', message);
    }
  });

  const cleanupAudioResources = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        track.stop();
        sessionLogger.info('Audio track stopped', { trackId: track.id });
      });
      micStreamRef.current = null;
    }

    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close().catch(error => {
        sessionLogger.error('Error closing AudioContext', error);
      });
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (isActive) {
        conversation.endSession().catch(error => {
          sessionLogger.error('Error cleaning up session', error);
        });
      }
      cleanupAudioResources();
    };
  }, [conversation, isActive, cleanupAudioResources]);

  const requestMicrophoneAccess = async () => {
    try {
      // First, request basic microphone access with minimal constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      sessionLogger.info('Basic microphone access granted');
      
      // Stop the initial stream as we'll create a new one with specific constraints
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      sessionLogger.error('Error requesting microphone access', error);
      throw new Error('Please grant microphone access to use voice features');
    }
  };

  const initializeAudioStream = async () => {
    try {
      // First ensure we have microphone permission
      await requestMicrophoneAccess();

      // Then create AudioContext with specific sample rate
      audioContextRef.current = new AudioContext({
        sampleRate: 24000,
        latencyHint: 'interactive'
      });

      // Now request stream with specific constraints for ElevenLabs
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 24000
        }
      });

      micStreamRef.current = stream;
      
      // Create audio nodes to ensure audio is flowing
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const destination = audioContextRef.current.createMediaStreamDestination();
      source.connect(destination);

      sessionLogger.info('Audio stream initialized', {
        sampleRate: audioContextRef.current.sampleRate,
        tracks: stream.getAudioTracks().length,
        audioContextState: audioContextRef.current.state
      });

      return stream;
    } catch (error) {
      sessionLogger.error('Error initializing audio stream', error);
      cleanupAudioResources();
      throw new Error('Failed to initialize audio. Please ensure microphone access is granted and try again.');
    }
  };

  const getSessionData = async () => {
    const { data, error } = await supabase.functions.invoke('get-eleven-labs-key');
    
    if (error) {
      throw new Error('Failed to get signed URL');
    }

    if (!data?.signed_url || !data?.agent_id) {
      throw new Error('Missing required connection data');
    }

    return {
      agentId: data.agent_id,
      signedUrl: data.signed_url
    };
  };

  const handleToggleVoice = useCallback(async () => {
    try {
      if (isActive) {
        setIsConnecting(true);
        await conversation.endSession();
        cleanupAudioResources();
        sessionLogger.info('Ended conversation');
      } else {
        setIsConnecting(true);
        
        // Get fresh session data first
        const data = await getSessionData();
        setSessionData(data);

        // Then initialize audio stream
        await initializeAudioStream();

        sessionLogger.info('Starting session', {
          agentId: data.agentId,
          audioContextState: audioContextRef.current?.state,
          micStreamActive: micStreamRef.current?.active
        });
        
        // Start the session with the signed URL
        await conversation.startSession({
          agentId: data.agentId,
          url: data.signedUrl
        });
        
        sessionLogger.info('Started conversation');
      }
    } catch (error) {
      console.error('Error toggling voice:', error);
      cleanupAudioResources();
      setIsActive(false);
      setIsConnecting(false);
      setSessionData(null);
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to voice service"
      });
    }
  }, [conversation, isActive, cleanupAudioResources]);

  return (
    <motion.div
      className="min-h-[100svh] bg-black text-white flex flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <AppHeader title="Voice Double" />
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <VoiceMicButton
            isActive={isActive}
            isConnecting={isConnecting}
            onClick={handleToggleVoice}
          />
          
          <VoiceStatus 
            status={isActive ? 'connected' : 'idle'}
            isSpeaking={conversation.isSpeaking}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceDouble;
