
import React from 'react';
import { motion } from 'framer-motion';
import { useVoiceContext } from '../VoiceControl/Context';

const formatTime = (seconds: number): string => {
  if (seconds === undefined || seconds === null) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const TimerDisplay: React.FC = () => {
  const { timerState } = useVoiceContext();
  
  if (timerState.remainingTime === undefined) return null;

  const isComplete = timerState.remainingTime <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="font-mono text-2xl transition-colors duration-300 mb-4"
      style={{ color: isComplete ? '#ea384c' : '#FFFFFF' }}
    >
      {formatTime(timerState.remainingTime)}
    </motion.div>
  );
};
