
export interface ImageGroup {
  id: string;
  images: string[];
}

export interface VibeImageProps {
  imageId: string;
  index: number;
  onClick: () => void;
}

export interface BackButtonProps {
  onClick: () => void;
}

export interface StatusIndicatorProps {
  status: 'idle' | 'connecting' | 'processing' | 'responding';
}

export interface WaveformVisualizationProps {
  isActive: boolean;
}

export interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
