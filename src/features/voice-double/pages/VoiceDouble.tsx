
import React from 'react';
import { AppHeader } from '@/components/layouts/AppHeader';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';

const VoiceDouble: React.FC = () => {
  const { 
    status,
    isSpeaking,
    hasMicPermission,
    start,
    stop
  } = useVoiceInteraction();

  const handleInteractionToggle = () => {
    if (status === 'connected') {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden">
      <AppHeader title="voice double" />
      
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="flex flex-col items-center gap-8">
          <VoiceMicButton
            status={status === 'connected' ? 'connected' : status === 'disconnected' ? 'idle' : 'connecting'}
            disabled={!hasMicPermission}
            onClick={handleInteractionToggle}
          />
          <VoiceStatus
            voiceName={isSpeaking ? "Speaking..." : "Voice Double"}
            status={status === 'connected' ? 'connected' : status === 'disconnected' ? 'idle' : 'connecting'}
          />
        </div>
      </main>
    </div>
  );
};

export default VoiceDouble;
