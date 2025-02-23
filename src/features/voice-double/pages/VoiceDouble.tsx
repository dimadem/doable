
import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '@/components/layouts/AppHeader';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { toast } from '@/components/ui/use-toast';

const VoiceDouble = () => {
  const { 
    status, 
    isSpeaking, 
    startInteraction, 
    stopInteraction 
  } = useVoiceInteraction();

  const handleToggleVoice = async () => {
    try {
      if (status === 'connected') {
        await stopInteraction();
      } else {
        await startInteraction();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          variant: "destructive",
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice features."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to connect to voice service. Please try again."
        });
      }
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
          status={status === 'connected' ? 'connected' : 'idle'}
          isSpeaking={isSpeaking}
        />
      </div>
    </motion.div>
  );
};

export default VoiceDouble;
