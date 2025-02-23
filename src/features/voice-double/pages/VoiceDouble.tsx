
import React, { useEffect } from 'react';
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
    stop,
    requestMicPermission
  } = useVoiceInteraction();

  useEffect(() => {
    requestMicPermission();
  }, [requestMicPermission]);

  const handleInteractionToggle = () => {
    if (status === 'connected') {
      stop();
    } else if (status === 'disconnected') {
      start();
    }
  };

  return (
    <div className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden">
      <AppHeader title="voice double" />
      
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="flex flex-col items-center gap-8">
          <VoiceMicButton
            status={status}
            disabled={!hasMicPermission}
            onClick={handleInteractionToggle}
          />
          <VoiceStatus
            voiceName={isSpeaking ? "Speaking..." : "Voice Double"}
            status={status}
          />
        </div>
      </main>
    </div>
  );
};

export default VoiceDouble;
