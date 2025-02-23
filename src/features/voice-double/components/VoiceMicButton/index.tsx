
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceMicButtonProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting';
  disabled?: boolean;
  onClick: () => void;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  status,
  disabled,
  onClick
}) => {
  return (
    <Button
      variant="outline"
      size="icon"
      disabled={disabled || status === 'disconnecting'}
      onClick={onClick}
      className="w-24 h-24 rounded-full border-2 border-white hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      {status === 'connecting' || status === 'disconnecting' ? (
        <Loader2 className="h-12 w-12 animate-spin" />
      ) : status === 'connected' ? (
        <MicOff className="h-12 w-12" />
      ) : (
        <Mic className="h-12 w-12" />
      )}
    </Button>
  );
};
