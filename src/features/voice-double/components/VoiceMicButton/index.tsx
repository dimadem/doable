
import React from 'react';
import { motion } from 'framer-motion';
import { Pause, Mic } from 'lucide-react';
import type { StatusIndicatorProps } from '../../types';

interface VoiceMicButtonProps {
  status: StatusIndicatorProps['status'];
  disabled: boolean;
  onClick: () => void;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  status,
  disabled,
  onClick
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center 
                 hover:bg-white/10 transition-colors border border-white/20
                 disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {status === 'idle' ? (
        <Mic className="w-8 h-8" />
      ) : (
        <Pause className="w-8 h-8" />
      )}
    </motion.button>
  );
};
