
import React from 'react';
import { cn } from '@/lib/utils';

interface VoiceStatusProps {
  status: 'connected' | 'disconnected' | 'connecting';
  voiceName?: string;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({
  status,
  voiceName = 'Voice Assistant'
}) => {
  const statusText = {
    disconnected: 'Click to start',
    connecting: 'Connecting...',
    connected: 'Listening...'
  }[status];

  return (
    <div className="flex flex-col items-center gap-2 font-mono">
      <div className="text-lg text-white">
        {voiceName}
      </div>
      <div className="text-sm text-white/60">
        {statusText}
      </div>
    </div>
  );
};
