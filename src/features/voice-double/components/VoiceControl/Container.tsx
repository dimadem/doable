
import React, { useMemo } from 'react';
import { VoiceProvider } from './Context';
import { useVoiceState } from '../../hooks/useVoiceState';
import { motion } from 'framer-motion';

interface VoiceControlContainerProps {
  children: React.ReactNode;
}

export const VoiceControlContainer: React.FC<VoiceControlContainerProps> = ({ children }) => {
  const voiceState = useVoiceState();
  
  const contextValue = useMemo(() => ({
    connection: {
      status: voiceState.status,
      conversationId: voiceState.conversationId
    },
    speech: {
      isSpeaking: voiceState.isSpeaking
    },
    timer: voiceState.timerState,
    actions: {
      startInteraction: voiceState.startInteraction,
      stopInteraction: voiceState.stopInteraction
    }
  }), [
    voiceState.status,
    voiceState.conversationId,
    voiceState.isSpeaking,
    voiceState.timerState,
    voiceState.startInteraction,
    voiceState.stopInteraction
  ]);

  return (
    <VoiceProvider value={voiceState}>
      <motion.div 
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {children}
      </motion.div>
    </VoiceProvider>
  );
};
