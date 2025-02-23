
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { VoiceStatus } from '../components/VoiceStatus';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { useVoiceAgent } from '../hooks/useVoiceAgent';

export const VoiceDouble = () => {
  const { status, isSpeaking, connect, disconnect } = useVoiceAgent();

  const handleToggleVoice = async () => {
    try {
      if (status === 'connected') {
        await disconnect();
      } else if (status === 'idle' || status === 'error') {
        await connect();
      }
    } catch (error) {
      console.error('Voice control error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono">
      <Card className="w-full max-w-md p-8 bg-black border border-white">
        <div className="flex flex-col items-center gap-8">
          <VoiceMicButton 
            isActive={status === 'connected'}
            isConnecting={status === 'connecting'}
            onClick={handleToggleVoice}
          />
          <VoiceStatus 
            status={status === 'connected' ? 'connected' : 'idle'}
            isSpeaking={isSpeaking}
          />
        </div>
      </Card>
    </div>
  );
};
