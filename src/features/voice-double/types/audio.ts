
export enum AudioPermissionError {
  NOT_ALLOWED = 'NotAllowedError',
  NOT_FOUND = 'NotFoundError',
  SECURITY = 'SecurityError',
  ABORT = 'AbortError'
}

export interface AudioPermissionState {
  isGranted: boolean;
  mediaStream: MediaStream | null;
  error: Error | null;
  lastCheck: Date | null;
}

export interface AudioPermissionErrorContext {
  type: AudioPermissionError;
  message: string;
  timestamp: string;
  attempts: number;
}
