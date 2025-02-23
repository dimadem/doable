
import React, { useEffect } from 'react';
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
    hasMicPermission,
    requestMicrophonePermission, 
    startInteraction, 
    stopInteraction 
  } = useVoiceInteraction();

  useEffect(() => {
    const requestPermission = async () => {
      try {
        await requestMicrophonePermission();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Microphone Access Required",
          description: "Please allow microphone access to use the voice features."
        });
      }
    };

    requestPermission();
  }, [requestMicrophonePermission]);

  const handleToggleVoice = async () => {
    if (status === 'connected') {
      await stopInteraction();
    } else if (status === 'disconnected') {
      if (!hasMicPermission) {
        toast({
          variant: "destructive",
          title: "Microphone Access Required",
          description: "Please allow microphone access to use the voice features."
        });
        return;
      }
      try {
        await startInteraction();
      } catch (error) {
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
          status={status === 'connected' ? 'connected' : 
                 status === 'connecting' ? 'connecting' : 'idle'}
          isSpeaking={isSpeaking}
        />

        {!hasMicPermission && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-mono text-center max-w-md px-4"
          >
            Microphone access is required for voice interaction.
            Please allow access when prompted.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceDouble;
