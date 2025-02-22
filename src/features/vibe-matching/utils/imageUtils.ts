
interface MediaMetadata {
  url: string;
  width?: number;
  height?: number;
  format?: string;
  loading: boolean;
  error: boolean;
  isVideo: boolean;
}

export const isVideo = (url: string): boolean => {
  try {
    return url.match(/\.(mp4)$/i) !== null;
  } catch {
    return false;
  }
};

export const validateMediaUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.match(/\.(jpg|jpeg|png|webp|gif|mp4)$/i) !== null;
  } catch {
    return false;
  }
};

export const preloadMedia = async (url: string): Promise<MediaMetadata> => {
  if (isVideo(url)) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        resolve({
          url,
          width: video.videoWidth,
          height: video.videoHeight,
          format: 'mp4',
          loading: false,
          error: false,
          isVideo: true
        });
      };

      video.onerror = () => {
        resolve({
          url,
          loading: false,
          error: true,
          isVideo: true
        });
      };

      video.src = url;
    });
  }

  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: url.split('.').pop()?.toLowerCase(),
        loading: false,
        error: false,
        isVideo: false
      });
    };

    img.onerror = () => {
      resolve({
        url,
        loading: false,
        error: true,
        isVideo: false
      });
    };

    img.src = url;
  });
};

export const optimizeMediaUrl = (url: string, width = 800): string => {
  // Add query parameters for CDN optimization if using one
  // For now, just return the original URL
  return url;
};
