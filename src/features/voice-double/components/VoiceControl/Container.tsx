
import React, { useMemo } from 'react';
import { VoiceProvider } from './Context';
import { useVoiceState } from '../../hooks/useVoiceState';
import { motion } from 'framer-motion';

interface VoiceControlContainerProps {
  children: React.ReactNode;
}

export const VoiceControlContainer: React.FC<VoiceControlContainerProps> = ({ children }) => {
  const voiceState = useVoiceState();
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => voiceState, [
    voiceState.status,
    voiceState.isSpeaking,
    voiceState.conversationId,
    voiceState.volume,
    voiceState.timerState
  ]);

  return (
    <VoiceProvider value={contextValue}>
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
