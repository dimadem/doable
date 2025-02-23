
import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { pulseVariants } from '@/animations/pageTransitions';

interface VoiceMicButtonProps {
  isActive: boolean;
  isConnecting: boolean;
  onClick: () => void;
  className?: string;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  isActive,
  isConnecting,
  onClick,
  className = ''
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={isConnecting}
      className={`relative w-32 h-32 rounded-full bg-black border-2 border-white 
                 flex items-center justify-center transition-colors
                 ${isActive ? 'hover:bg-white hover:text-black' : 'hover:border-red-500'}
                 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        variants={pulseVariants}
        animate={isActive ? "active" : "idle"}
        className="absolute inset-0 rounded-full border-2 border-white/50"
      />
      {isActive ? (
        <MicOff className="w-8 h-8" />
      ) : (
        <Mic className="w-8 h-8" />
      )}
    </motion.button>
  );
};
