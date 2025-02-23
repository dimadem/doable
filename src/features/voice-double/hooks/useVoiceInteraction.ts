
import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { sessionLogger } from '@/utils/sessionLogger';

export const useVoiceInteraction = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const conversation = useConversation({
    onConnect: () => {
      setStatus('connected');
      sessionLogger.info('Voice interaction connected');
    },
    onDisconnect: () => {
      setStatus('idle');
      sessionLogger.info('Voice interaction disconnected');
    },
    onError: (error) => {
      sessionLogger.error('Voice interaction error', error);
      setStatus('error');
    }
  });

  const startInteraction = useCallback(async () => {
    try {
      setStatus('connecting');
      sessionLogger.info('Starting voice interaction');
      
      // Get the signed URL using our Supabase function
      const { data, error } = await supabase
        .functions.invoke('get-eleven-labs-key');
      
      if (error) {
        sessionLogger.error('Failed to get signed URL', error);
        throw error;
      }
      
      if (!data?.signed_url) {
        throw new Error('No signed URL received from server');
      }
      
      // Start the conversation with the signed URL
      await conversation.startSession({
        url: data.signed_url
      });
      
      sessionLogger.info('Voice interaction started successfully');
    } catch (error) {
      sessionLogger.error('Failed to start voice interaction', error);
      setStatus('error');
      throw error; // Re-throw to let the component handle the error
    }
  }, [conversation]);

  const stopInteraction = useCallback(async () => {
    try {
      sessionLogger.info('Stopping voice interaction');
      await conversation.endSession();
      setStatus('idle');
    } catch (error) {
      sessionLogger.error('Failed to stop voice interaction', error);
      setStatus('error');
      throw error;
    }
  }, [conversation]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
    } catch (error) {
      sessionLogger.error('Failed to set volume', error);
      throw error;
    }
  }, [conversation]);

  return {
    status,
    isSpeaking: conversation.isSpeaking,
    startInteraction,
    stopInteraction,
    setVolume
  };
};
