
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '@/components/layouts/AppHeader';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { toast } from '@/components/ui/use-toast';

const VoiceDouble = () => {
  const { status, isSpeaking, startInteraction, stopInteraction } = useVoiceInteraction();

  useEffect(() => {
    if (status === 'error') {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to voice service. Please try again."
      });
    }
  }, [status]);

  const handleToggleVoice = () => {
    if (status === 'connected') {
      stopInteraction();
    } else if (status === 'idle') {
      startInteraction();
    }
  };

  return (
    <motion.div
      className="min-h-[100svh] bg-black text-white flex flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <AppHeader title="Voice Double" />
      
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <VoiceMicButton
          isActive={status === 'connected'}
          isConnecting={status === 'connecting'}
          onClick={handleToggleVoice}
        />
        
        <VoiceStatus 
          status={status}
          isSpeaking={isSpeaking}
        />
      </div>
    </motion.div>
  );
};

export default VoiceDouble;
