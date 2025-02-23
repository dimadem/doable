
import React from 'react';
import { cn } from '@/lib/utils';

interface VoiceStatusProps {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  voiceName?: string;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({
  status,
  voiceName = 'Voice Assistant'
}) => {
  const statusText = {
    idle: 'Click to start',
    connecting: 'Connecting...',
    connected: 'Listening...',
    error: 'Connection error'
  }[status];

  return (
    <div className="flex flex-col items-center gap-2 font-mono">
      <div className={cn(
        "text-lg",
        status === 'error' ? 'text-red-500' : 'text-white'
      )}>
        {voiceName}
      </div>
      <div className="text-sm text-white/60">
        {statusText}
      </div>
    </div>
  );
};
