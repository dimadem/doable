
import React, { useState, useCallback, useRef } from 'react';
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
  const audioContextRef = useRef<AudioContext | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      sessionLogger.info('Voice connection established');
      setIsConnecting(false);
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed');
      setIsActive(false);
      setIsConnecting(false);
      // Cleanup audio context when disconnected
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', error);
      setIsActive(false);
      setIsConnecting(false);
      // Cleanup audio context on error
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to voice service. Please try again."
      });
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', message);
    }
  });

  const initializeAudioContext = async () => {
    // Create new audio context if it doesn't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    // If the context is in suspended state, resume it
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const handleToggleVoice = useCallback(async () => {
    try {
      if (isActive) {
        await conversation.endSession();
        setIsActive(false);
        console.log('Ended conversation');
        
        // Cleanup audio context
        if (audioContextRef.current) {
          await audioContextRef.current.close();
          audioContextRef.current = null;
        }
      } else {
        setIsConnecting(true);

        // First request microphone access
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (micError) {
          throw new Error('Microphone access is required. Please allow microphone access and try again.');
        }

        // Initialize audio context before starting the session
        await initializeAudioContext();
        
        const { data, error: signedUrlError } = await supabase.functions.invoke('get-eleven-labs-key');
        
        if (signedUrlError) {
          throw new Error('Failed to get signed URL');
        }

        if (!data?.signed_url || !data?.agent_id) {
          throw new Error('Missing required connection data');
        }

        console.log('Starting session with:', {
          agentId: data.agent_id,
          signedUrl: data.signed_url
        });

        // Ensure audio context is in running state before starting session
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        await conversation.startSession({
          agentId: data.agent_id,
          url: data.signed_url
        });
        
        setIsActive(true);
        console.log('Started conversation');
      }
    } catch (error) {
      console.error('Error toggling voice:', error);
      setIsActive(false);
      setIsConnecting(false);
      
      // Cleanup audio context on error
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to voice service"
      });
    }
  }, [conversation, isActive]);

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
