
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

  useEffect(() => {
    return () => {
      if (isActive) {
        conversation.endSession().catch(error => {
          sessionLogger.error('Error cleaning up session', error);
        });
      }
    };
  }, [conversation, isActive]);

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
        sessionLogger.info('Ended conversation');
      } else {
        setIsConnecting(true);

        // First, request microphone permission
        try {
          await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          sessionLogger.info('Microphone access granted');
        } catch (error) {
          sessionLogger.error('Microphone access denied', error);
          throw new Error('Please grant microphone access to use voice features');
        }

        // Get session data
        const data = await getSessionData();
        
        // Start the session with the signed URL
        await conversation.startSession({
          agentId: data.agentId,
          url: data.signedUrl
        });
        
        sessionLogger.info('Started conversation');
      }
    } catch (error) {
      console.error('Error toggling voice:', error);
      setIsActive(false);
      setIsConnecting(false);
      
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
