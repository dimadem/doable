
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Loader2, Film } from 'lucide-react';
import { VibeImageProps } from '../../types';
import { useIsMobile } from '@/hooks/use-mobile';

export const VibeMedia: React.FC<VibeImageProps> = ({ imageId, index, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Determine if the media is a video based on file extension
  useEffect(() => {
    const isVideoFile = imageId.toLowerCase().endsWith('.mp4');
    setIsVideo(isVideoFile);
  }, [imageId]);

  // Handle video playback
  const toggleVideoPlayback = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Video playback error:', error);
    }
  };

  // Handle video loading
  const handleVideoLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
    
    // Start playing on non-iOS mobile devices
    if (isMobile && !isIOS && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
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

  // Configure video for optimal playback
  const configureVideoPlayback = (videoElement: HTMLVideoElement) => {
    videoElement.playsInline = true;
    videoElement.muted = true;
    videoElement.preload = isMobile ? "metadata" : "auto";
    
    if (isMobile) {
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('webkit-playsinline', 'true');
      
      // Set lower resolution for mobile
      if (!isIOS) {
        videoElement.width = 480;
        videoElement.height = 360;
      }
    }
  };

  // Handle click events
  const handleClick = (e: React.MouseEvent) => {
    if (isVideo) {
      e.preventDefault();
      e.stopPropagation();
      toggleVideoPlayback();
    }
    onClick?.();
  };

  useEffect(() => {
    if (videoRef.current) {
      configureVideoPlayback(videoRef.current);
    }

    // Cleanup
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
  }, [isMobile, isIOS]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleClick}
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
            src={imageId}
            className={`w-full h-full object-cover transition-all duration-300 
                      ${!isLoading ? 'grayscale group-hover:grayscale-0' : 'opacity-0'}`}
            onLoadedData={handleVideoLoadedData}
            onError={handleVideoError}
            muted
            playsInline
            loop
            preload={isMobile ? "metadata" : "auto"}
          />
          <div className="absolute bottom-2 right-2">
            <Film className="w-4 h-4 text-white opacity-50" />
          </div>
          {isIOS && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 pointer-events-none">
              <span className="text-white text-sm">Tap to play</span>
            </div>
          )}
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
