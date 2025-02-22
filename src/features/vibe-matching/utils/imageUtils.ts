
interface ImageMetadata {
  url: string;
  width?: number;
  height?: number;
  format?: string;
  loading: boolean;
  error: boolean;
}

export const validateImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.match(/\.(jpg|jpeg|png|webp|gif)$/i) !== null;
  } catch {
    return false;
  }
};

export const preloadImage = async (url: string): Promise<ImageMetadata> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: url.split('.').pop()?.toLowerCase(),
        loading: false,
        error: false
      });
    };

    img.onerror = () => {
      resolve({
        url,
        loading: false,
        error: true
      });
    };

    img.src = url;
  });
};

export const optimizeImageUrl = (url: string, width = 800): string => {
  // Add query parameters for CDN optimization if using one
  // For now, just return the original URL
  return url;
};
