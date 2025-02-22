
import React from 'react';
import { motion } from 'framer-motion';
import { VibeImageProps } from '../../types/vibe';

export const VibeImage: React.FC<VibeImageProps> = ({ imageId, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className="w-full aspect-[4/3] relative overflow-hidden rounded-lg cursor-pointer group"
  >
    <img
      src={imageId} // Now using the direct URL
      alt={`choice ${index + 1}`}
      className="w-full h-full object-cover filter grayscale transition-all duration-300 
                group-hover:grayscale-0 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 
                    transition-all duration-300" />
  </motion.div>
);
