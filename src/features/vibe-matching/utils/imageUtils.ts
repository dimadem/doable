
interface MediaMetadata {
  url: string;
  width?: number;
  height?: number;
  format?: string;
  loading: boolean;
  error: boolean;
  isVideo: boolean;
}

const mediaCache = new Map<string, MediaMetadata>();

export const isVideo = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.match(/\.(mp4|webm|mov)$/i) !== null;
  } catch {
    return false;
  }
};

export const validateMediaUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.match(/\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i) !== null;
  } catch {
    return false;
  }
};

export const preloadMedia = async (url: string): Promise<MediaMetadata> => {
  if (mediaCache.has(url)) {
    return mediaCache.get(url)!;
  }

  const metadata: MediaMetadata = {
    url,
    loading: true,
    error: false,
    isVideo: isVideo(url)
  };

  try {
    if (metadata.isVideo) {
      return await new Promise((resolve) => {
        const video = document.createElement('video');
        const timeoutId = setTimeout(() => {
          video.onerror?.(new Error('Timeout') as any);
        }, 10000);

        video.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          metadata.width = video.videoWidth;
          metadata.height = video.videoHeight;
          metadata.format = url.split('.').pop()?.toLowerCase();
          metadata.loading = false;
          mediaCache.set(url, metadata);
          resolve(metadata);
        };

        video.onerror = () => {
          clearTimeout(timeoutId);
          metadata.error = true;
          metadata.loading = false;
          mediaCache.set(url, metadata);
          resolve(metadata);
        };

        video.src = url;
        video.load();
      });
    }

    return await new Promise((resolve) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        img.onerror?.(new Error('Timeout') as any);
      }, 10000);

      img.onload = () => {
        clearTimeout(timeoutId);
        metadata.width = img.naturalWidth;
        metadata.height = img.naturalHeight;
        metadata.format = url.split('.').pop()?.toLowerCase();
        metadata.loading = false;
        mediaCache.set(url, metadata);
        resolve(metadata);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        metadata.error = true;
        metadata.loading = false;
        mediaCache.set(url, metadata);
        resolve(metadata);
      };

      img.src = url;
    });
  } catch (error) {
    metadata.error = true;
    metadata.loading = false;
    mediaCache.set(url, metadata);
    return metadata;
  }
};

export const optimizeMediaUrl = (url: string, width = 800): string => {
  try {
    const urlObj = new URL(url);
    // Add CDN optimization parameters here if needed
    return urlObj.toString();
  } catch {
    console.error('Invalid URL:', url);
    return url;
  }
};
