
import React from 'react';
import { motion } from 'framer-motion';
import { StatusIndicatorProps } from '../../types';

const statusConfig = {
  idle: {
    color: 'bg-purple-500',
    text: 'Ready',
    pulseAnimation: false
  },
  connecting: {
    color: 'bg-blue-500',
    text: 'Connecting...',
    pulseAnimation: true
  },
  processing: {
    color: 'bg-orange-500',
    text: 'Processing...',
    pulseAnimation: true
  },
  responding: {
    color: 'bg-green-500',
    text: 'Responding',
    pulseAnimation: true
  },
  connected: {
    color: 'bg-blue-500',
    text: 'Connected',
    pulseAnimation: false
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <motion.div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <motion.div 
        className={`w-2 h-2 rounded-full ${config.color}`}
        animate={config.pulseAnimation ? {
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1]
        } : {}}
        transition={config.pulseAnimation ? {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      />
      <span className="font-mono text-sm text-white/80">{config.text}</span>
    </motion.div>
  );
};

export default StatusIndicator;
