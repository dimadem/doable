
import React, { useState, useCallback, useEffect } from 'react';
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

  const conversation = useConversation({
    overrides: {
      agent: {
        firstMessage: "Hello! I'm your AI voice assistant. How can I help you today?",
      }
    },
    onConnect: () => {
      sessionLogger.info('Voice connection established');
      setIsConnecting(false);
      setIsActive(true);
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed');
      setIsActive(false);
      setIsConnecting(false);
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', error);
      setIsActive(false);
      setIsConnecting(false);
      
      // Check for specific error types
      if (error instanceof CloseEvent && error.code === 3000) {
        toast({
          variant: "destructive",
          title: "Authorization Error",
          description: "Failed to authorize the voice connection. Please try again."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to connect to voice service"
        });
      }
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', message);
    }
  });

  const startConnection = useCallback(async () => {
    try {
      setIsConnecting(true);

      // First, ensure we have microphone access
      await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      const { data, error } = await supabase.functions.invoke('get-eleven-labs-key');
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to get connection data');
      }

      if (!data?.signed_url || !data?.agent_id) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid connection data received');
      }

      sessionLogger.info('Starting session with agent', { agentId: data.agent_id });
      
      await conversation.startSession({
        agentId: data.agent_id,
        url: data.signed_url
      });
      
      sessionLogger.info('Started conversation successfully');
    } catch (error) {
      console.error('Error starting connection:', error);
      setIsActive(false);
      setIsConnecting(false);
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use the voice feature"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to connect to voice service"
        });
      }
    }
  }, [conversation]);

  // Auto-start connection when component mounts
  useEffect(() => {
    startConnection();

    // Cleanup on unmount
    return () => {
      if (isActive) {
        conversation.endSession().catch(error => {
          sessionLogger.error('Error cleaning up session', error);
        });
      }
    };
  }, [conversation, isActive, startConnection]);

  const handleToggleVoice = useCallback(async () => {
    if (isActive) {
      setIsConnecting(true);
      await conversation.endSession();
      sessionLogger.info('Ended conversation');
    } else {
      startConnection();
    }
  }, [conversation, isActive, startConnection]);

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
