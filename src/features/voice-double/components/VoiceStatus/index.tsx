
import React from 'react';
import { motion } from 'framer-motion';

interface VoiceStatusProps {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  isSpeaking: boolean;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ status, isSpeaking }) => {
  const getStatusText = () => {
    if (status === 'connecting') return 'Connecting...';
    if (status === 'connected' && isSpeaking) return 'Agent is speaking...';
    if (status === 'connected') return 'Agent is listening...';
    if (status === 'error') return 'Connection error';
    return 'Ready to start';
  };

  const getStatusColor = () => {
    if (status === 'connecting') return 'text-yellow-400';
    if (status === 'connected') return 'text-green-400';
    if (status === 'error') return 'text-red-400';
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
