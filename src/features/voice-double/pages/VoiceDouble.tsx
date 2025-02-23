
import React from 'react';
import { Card } from '@/components/ui/card';
import { VoiceStatus } from '../components/VoiceStatus';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceProvider } from '../components/VoiceControl/Context';
import { TimerDisplay } from '../components/TimerDisplay';

export const VoiceDouble = () => {
  return (
    <VoiceProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono">
        <Card className="w-full max-w-md p-8 bg-black border border-white">
          <div className="flex flex-col items-center gap-8">
            <TimerDisplay />
            <VoiceMicButton />
            <VoiceStatus status="idle" isSpeaking={false} />
          </div>
        </Card>
      </div>
    </VoiceProvider>
  );
};
