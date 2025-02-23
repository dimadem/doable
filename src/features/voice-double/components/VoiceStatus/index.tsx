
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
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-sm text-white/60">
        {voiceName || 'Default Voice'}
      </p>
      <p className="font-mono text-xs text-white/40">
        Status: {status}
      </p>
    </div>
  );
};
