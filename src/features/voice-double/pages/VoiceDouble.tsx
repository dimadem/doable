
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

  // Cleanup on unmount
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

  const initializeAudioStream = async () => {
    try {
      // Create AudioContext with specific sample rate for ElevenLabs
      audioContextRef.current = new AudioContext({
        sampleRate: 24000,
        latencyHint: 'interactive'
      });

      // Request microphone access with specific constraints
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
      sessionLogger.info('Audio stream initialized', {
        sampleRate: audioContextRef.current.sampleRate,
        tracks: stream.getAudioTracks().length
      });

      return stream;
    } catch (error) {
      sessionLogger.error('Error initializing audio stream', error);
      throw new Error('Microphone access is required. Please allow microphone access and try again.');
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

        // Initialize audio stream before starting session
        await initializeAudioStream();
        
        // Get fresh session data
        const data = await getSessionData();
        setSessionData(data);

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
