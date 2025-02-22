
import { MediaMetadata } from '../types';

const mediaCache = new Map<string, MediaMetadata>();
const loadingPromises = new Map<string, Promise<MediaMetadata>>();

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
  // Return cached result if available
  if (mediaCache.has(url)) {
    return mediaCache.get(url)!;
  }

  // Return existing promise if media is already loading
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  const loadPromise = new Promise<MediaMetadata>(async (resolve) => {
    const metadata: MediaMetadata = {
      url,
      loading: true,
      error: false,
      isVideo: isVideo(url)
    };

    try {
      if (metadata.isVideo) {
        const video = document.createElement('video');
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 10000);

          video.onloadedmetadata = () => {
            clearTimeout(timeoutId);
            metadata.width = video.videoWidth;
            metadata.height = video.videoHeight;
            metadata.format = url.split('.').pop()?.toLowerCase();
            metadata.loading = false;
            resolve(null);
          };

          video.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Failed to load video'));
          };

          video.src = url;
          video.load();
        });
      } else {
        const img = new Image();
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 10000);

          img.onload = () => {
            clearTimeout(timeoutId);
            metadata.width = img.naturalWidth;
            metadata.height = img.naturalHeight;
            metadata.format = url.split('.').pop()?.toLowerCase();
            metadata.loading = false;
            resolve(null);
          };

          img.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Failed to load image'));
          };

          img.src = url;
        });
      }
    } catch (error) {
      metadata.error = true;
      console.error(`Failed to load media: ${url}`, error);
    } finally {
      metadata.loading = false;
      mediaCache.set(url, metadata);
      loadingPromises.delete(url);
    }

    resolve(metadata);
  });

  loadingPromises.set(url, loadPromise);
  return loadPromise;
};

export const optimizeMediaUrl = (url: string, width = 800): string => {
  try {
    const urlObj = new URL(url);
    // Add CDN optimization parameters here if needed
    // For example: urlObj.searchParams.set('w', width.toString());
    return urlObj.toString();
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return url;
  }
};
