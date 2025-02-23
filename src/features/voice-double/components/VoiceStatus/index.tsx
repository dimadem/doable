
import React from 'react';
import { motion } from 'framer-motion';

interface VoiceStatusProps {
  status: 'idle' | 'connected';
  isSpeaking: boolean;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ status, isSpeaking }) => {
  const getStatusText = () => {
    if (status === 'connected' && isSpeaking) return 'Agent is speaking...';
    if (status === 'connected') return 'Agent is listening...';
    return 'Ready to start';
  };

  const getStatusColor = () => {
    if (status === 'connected') return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`font-mono text-sm ${getStatusColor()}`}
    >
      {getStatusText()}
    </motion.div>
  );
};
