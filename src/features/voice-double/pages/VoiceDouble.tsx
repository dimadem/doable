
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppHeader } from '@/components/layouts/AppHeader';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';

const ALLOWED_PERSONALITIES = ['emotive', 'hyperthymic', 'persistent_paranoid'];
const DEFAULT_PERSONALITY = 'persistent_paranoid';

const VoiceDouble: React.FC = () => {
  const [searchParams] = useSearchParams();
  const personalityParam = searchParams.get('personality');
  const personalityKey = ALLOWED_PERSONALITIES.includes(personalityParam || '') 
    ? personalityParam 
    : DEFAULT_PERSONALITY;

  const { data: voiceConfig, isLoading } = useVoiceAgent(personalityKey);
  const { status, handleInteractionToggle } = useVoiceInteraction(voiceConfig);

  return (
    <div className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden">
      <AppHeader title="voice double" />

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        {isLoading ? (
          <div className="text-white/60 font-mono">Loading voice configuration...</div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <VoiceMicButton
              status={status}
              disabled={isLoading || !voiceConfig}
              onClick={handleInteractionToggle}
            />
            <VoiceStatus
              voiceName={voiceConfig?.voice_name || ''}
              status={status}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default VoiceDouble;
