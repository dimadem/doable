
import React from 'react';
import type { StatusIndicatorProps } from '../../types';

interface VoiceStatusProps {
  voiceName: string;
  status: StatusIndicatorProps['status'];
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({
  voiceName,
  status
}) => {
  const getStatusMessage = (status: StatusIndicatorProps['status']) => {
    switch (status) {
      case 'connecting':
        return 'Connecting... Please wait';
      case 'connected':
        return 'Connected - Start speaking';
      case 'idle':
        return 'Click microphone to start';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-sm text-white/60">
        {voiceName || 'Default Voice'}
      </p>
      <p className="font-mono text-xs text-white/40">
        {getStatusMessage(status)}
      </p>
    </div>
  );
};
