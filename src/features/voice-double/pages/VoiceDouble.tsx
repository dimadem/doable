
import React from 'react';
import { AppHeader } from '@/components/layouts/AppHeader';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';

const VoiceDouble: React.FC = () => {
  const { status, handleInteractionToggle } = useVoiceInteraction();

  return (
    <div className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden">
      <AppHeader title="voice double" />
      
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="flex flex-col items-center gap-8">
          <VoiceMicButton
            status={status}
            onClick={handleInteractionToggle}
          />
          <VoiceStatus
            voiceName="Voice Double"
            status={status}
          />
        </div>
      </main>
    </div>
  );
};

export default VoiceDouble;
