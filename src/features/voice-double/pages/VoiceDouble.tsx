
import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '@/components/layouts/AppHeader';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';
import { TimerDisplay } from '../components/TimerDisplay';
import { VoiceControlContainer } from '../components/VoiceControl/Container';
import { useVoiceContext } from '../components/VoiceControl/Context';

const VoiceControls = () => {
  const { state, actions } = useVoiceContext();

  const handleToggleVoice = async () => {
    try {
      if (state.status === 'connected') {
        await actions.stopInteraction();
      } else if (state.status === 'idle' || state.status === 'error') {
        await actions.startInteraction();
      }
    } catch (error) {
      console.error('Voice control error:', error);
    }
  };

  return (
    <>
      <VoiceMicButton
        isActive={state.status === 'connected'}
        isConnecting={state.status === 'connecting'}
        onClick={handleToggleVoice}
      />
      
      <TimerDisplay />
      
      <VoiceStatus 
        status={state.status === 'connected' ? 'connected' : 'idle'}
        isSpeaking={state.isSpeaking}
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
