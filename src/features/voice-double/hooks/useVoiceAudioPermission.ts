
import { useState, useEffect, useCallback } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';
import { AudioPermissionState, AudioPermissionError } from '../types/audio';

export const useVoiceAudioPermission = () => {
  const [permissionState, setPermissionState] = useState<AudioPermissionState>({
    isGranted: false,
    mediaStream: null,
    error: null,
    lastCheck: null
  });

  const requestPermission = useCallback(async () => {
    try {
      sessionLogger.info('Requesting audio permission');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setPermissionState({
        isGranted: true,
        mediaStream: stream,
        error: null,
        lastCheck: new Date()
      });

      sessionLogger.info('Audio permission granted', {
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      const errorType = error instanceof Error ? error.name as AudioPermissionError : AudioPermissionError.ABORT;
      
      sessionLogger.error('Audio permission error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: errorType,
        timestamp: new Date().toISOString()
      });

      setPermissionState(prev => ({
        ...prev,
        isGranted: false,
        error: error as Error,
        lastCheck: new Date()
      }));

      return false;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (permissionState.mediaStream) {
      permissionState.mediaStream.getTracks().forEach(track => track.stop());
      setPermissionState(prev => ({
        ...prev,
        mediaStream: null
      }));
      sessionLogger.info('Audio stream cleaned up');
    }
  }, [permissionState.mediaStream]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    permissionState,
    requestPermission,
    cleanup
  };
};
