
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Loader2, VideoOff } from 'lucide-react';
import { VibeImageProps } from '../../types';
import { optimizeMediaUrl, isVideo } from '../../utils/imageUtils';

export const VibeImage: React.FC<VibeImageProps> = ({ imageId, index, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedUrl, setOptimizedUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const isVideoContent = isVideo(imageId);

  useEffect(() => {
    setOptimizedUrl(optimizeMediaUrl(imageId));
    
    // Set a loading timeout
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading && !hasError && retryCountRef.current < 2) {
        console.log(`Retrying load for ${imageId}`);
        retryCountRef.current += 1;
        setIsLoading(true);
        setHasError(false);
        // Force reload by updating the optimized URL with a cache buster
        setOptimizedUrl(`${optimizeMediaUrl(imageId)}?t=${Date.now()}`);
      } else if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [imageId, isLoading, hasError]);

  const handleLoad = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);
    console.log(`Successfully loaded ${imageId}`);
  };

  const handleError = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
    setHasError(true);
    console.error(`Failed to load media: ${imageId}`);
  };

  const handleMouseEnter = () => {
    if (isVideoContent && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleMouseLeave = () => {
    if (isVideoContent && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={!hasError ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full aspect-[4/3] relative overflow-hidden rounded-lg 
                 ${!hasError && !isLoading ? 'cursor-pointer' : ''} group`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-red-900/20 flex flex-col items-center justify-center gap-2">
          {isVideoContent ? (
            <VideoOff className="w-6 h-6 text-red-500" />
          ) : (
            <ImageOff className="w-6 h-6 text-red-500" />
          )}
          <div className="text-red-500 text-sm">Failed to load {isVideoContent ? 'video' : 'image'}</div>
        </div>
      ) : (
        <>
          {isVideoContent ? (
            <video
              ref={videoRef}
              src={optimizedUrl}
              className={`w-full h-full object-cover transition-all duration-300 
                        ${!isLoading ? 'group-hover:scale-105' : 'opacity-0'}`}
              onLoadedData={handleLoad}
              onError={handleError}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={optimizedUrl}
              alt={`choice ${index + 1}`}
              className={`w-full h-full object-cover filter transition-all duration-300 
                        ${!isLoading ? 'grayscale group-hover:grayscale-0 group-hover:scale-105' : 'opacity-0'}`}
              onLoad={handleLoad}
              onError={handleError}
              loading={index > 1 ? 'lazy' : 'eager'}
            />
          )}
          {!isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 
                          transition-all duration-300" />
          )}
        </>
      )}
    </motion.div>
  );
};

export default VibeImage;
