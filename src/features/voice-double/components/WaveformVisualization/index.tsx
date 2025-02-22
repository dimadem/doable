
import React from 'react';
import { motion } from 'framer-motion';
import { WaveformVisualizationProps } from '../../types';

export const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({ isActive }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex items-center gap-1 h-full">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-white/30"
          animate={{
            height: isActive ? [20, 40 + Math.random() * 40, 20] : 20,
          }}
          transition={{
            duration: 0.5,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  </div>
);

export default WaveformVisualization;
