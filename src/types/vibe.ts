
export interface ImageGroup {
  id: string;
  images: string[];
}

export interface VibeImageProps {
  imageId: string;
  index: number;
  onClick: () => void;
}
