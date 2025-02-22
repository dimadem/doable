
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VibeImageProps } from '../../types';

export const VibeImage: React.FC<VibeImageProps> = ({ imageId, index, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={!hasError ? onClick : undefined}
      className={`w-full aspect-[4/3] relative overflow-hidden rounded-lg 
                 ${!hasError && !isLoading ? 'cursor-pointer' : ''} group`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
          <div className="text-red-500">Failed to load image</div>
        </div>
      ) : (
        <img
          src={imageId}
          alt={`choice ${index + 1}`}
          className={`w-full h-full object-cover filter transition-all duration-300 
                    ${!isLoading ? 'grayscale group-hover:grayscale-0 group-hover:scale-105' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {!isLoading && !hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 
                      transition-all duration-300" />
      )}
    </motion.div>
  );
};

export default VibeImage;
