
import React from 'react';
import { Card } from '@/components/ui/card';
import { VoiceStatus } from '../components/VoiceStatus';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceProvider } from '../components/VoiceControl/Context';
import { TimerDisplay } from '../components/TimerDisplay';
import { useVoiceState } from '../hooks/useVoiceState';

const VoiceControls = () => {
  const { state, actions } = useVoiceState();

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
    <div className="flex flex-col items-center gap-8">
      <TimerDisplay />
      <VoiceMicButton 
        isActive={state.status === 'connected'}
        isConnecting={state.status === 'connecting'}
        onClick={handleToggleVoice}
      />
      <VoiceStatus 
        status={state.status}
        isSpeaking={false}
      />
    </div>
  );
};

export const VoiceDouble = () => {
  const voiceState = useVoiceState();

  return (
    <VoiceProvider value={voiceState}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono">
        <Card className="w-full max-w-md p-8 bg-black border border-white">
          <VoiceControls />
        </Card>
      </div>
    </VoiceProvider>
  );
};
