
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Loader2, Film } from 'lucide-react';
import { VibeImageProps } from '../../types';
import { useIsMobile } from '@/hooks/use-mobile';

export const VibeMedia: React.FC<VibeImageProps> = ({ imageId, index, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  // Function to modify video URL for mobile optimization
  const getOptimizedVideoUrl = (url: string): string => {
    if (!isVideo || !isMobile) return url;

    try {
      const urlObj = new URL(url);
      // Add quality parameter for mobile devices
      // Assuming the video service accepts these parameters
      urlObj.searchParams.set('quality', 'low');
      urlObj.searchParams.set('optimize', 'true');
      return urlObj.toString();
    } catch (e) {
      console.error('Failed to optimize video URL:', e);
      return url;
    }
  };

  // Determine if the media is a video based on file extension
  useEffect(() => {
    const isVideoFile = imageId.toLowerCase().endsWith('.mp4');
    setIsVideo(isVideoFile);
  }, [imageId]);

  // Handle video loading
  const handleVideoLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle video error
  const handleVideoError = () => {
    console.error(`Failed to load video: ${imageId}`);
    setIsLoading(false);
    setHasError(true);
  };

  // Handle image loading
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle image error
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error(`Failed to load media: ${imageId}`);
  };

  // Optimize video playback settings
  const configureVideoPlayback = (videoElement: HTMLVideoElement) => {
    if (isMobile) {
      videoElement.preload = "metadata";
      videoElement.playsInline = true;
      // Lower quality for mobile
      videoElement.width = 480;
      videoElement.height = 360;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      configureVideoPlayback(videoRef.current);
    }
  }, [isMobile]);

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
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-red-900/20 flex flex-col items-center justify-center gap-2">
          <ImageOff className="w-6 h-6 text-red-500" />
          <div className="text-red-500 text-sm">Failed to load media</div>
        </div>
      ) : isVideo ? (
        <>
          <video
            ref={videoRef}
            src={getOptimizedVideoUrl(imageId)}
            className={`w-full h-full object-cover transition-all duration-300 
                      ${!isLoading ? 'grayscale group-hover:grayscale-0' : 'opacity-0'}`}
            onLoadedData={handleVideoLoadedData}
            onError={handleVideoError}
            muted
            playsInline
            loop
            onMouseEnter={() => videoRef.current?.play()}
            onMouseLeave={() => videoRef.current?.pause()}
            preload="metadata"
          />
          <div className="absolute bottom-2 right-2">
            <Film className="w-4 h-4 text-white opacity-50" />
          </div>
        </>
      ) : (
        <img
          src={imageId}
          alt={`choice ${index + 1}`}
          className={`w-full h-full object-cover filter transition-all duration-300 
                    ${!isLoading ? 'grayscale group-hover:grayscale-0 group-hover:scale-105' : 'opacity-0'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={index > 1 ? 'lazy' : 'eager'}
        />
      )}
      {!isLoading && !hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 
                      transition-all duration-300" />
      )}
    </motion.div>
  );
};

export default VibeMedia;
