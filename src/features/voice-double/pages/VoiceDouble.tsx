
import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '@/components/layouts/AppHeader';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';
import { TimerDisplay } from '../components/TimerDisplay';
import { VoiceControlContainer } from '../components/VoiceControl/Container';
import { useVoiceContext } from '../components/VoiceControl/Context';
import { toast } from '@/components/ui/use-toast';

const VoiceControls = () => {
  const { status, isSpeaking, startInteraction, stopInteraction } = useVoiceContext();

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
    <>
      <VoiceMicButton
        isActive={status === 'connected'}
        isConnecting={status === 'connecting'}
        onClick={handleToggleVoice}
      />
      
      <TimerDisplay />
      
      <VoiceStatus 
        status={status === 'connected' ? 'connected' : 'idle'}
        isSpeaking={isSpeaking}
      />
    </>
  );
};

const VoiceDouble = () => {
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
        <VoiceControlContainer>
          <VoiceControls />
        </VoiceControlContainer>
      </div>
    </motion.div>
  );
};

export default VoiceDouble;
