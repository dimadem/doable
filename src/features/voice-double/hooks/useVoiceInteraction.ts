
import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceInteraction = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const conversation = useConversation({
    onConnect: () => setStatus('connected'),
    onDisconnect: () => setStatus('idle'),
    onError: () => setStatus('error')
  });

  const startInteraction = useCallback(async () => {
    try {
      setStatus('connecting');
      
      // Get the signed URL using our Supabase function
      const { data: { signed_url }, error } = await supabase
        .functions.invoke('get-eleven-labs-key');
      
      if (error) throw error;
      
      // Start the conversation with the signed URL
      await conversation.startSession({
        url: signed_url
      });
    } catch (error) {
      console.error('Failed to start voice interaction:', error);
      setStatus('error');
    }
  }, [conversation]);

  const stopInteraction = useCallback(async () => {
    try {
      await conversation.endSession();
      setStatus('idle');
    } catch (error) {
      console.error('Failed to stop voice interaction:', error);
      setStatus('error');
    }
  }, [conversation]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
    } catch (error) {
      console.error('Failed to set volume:', error);
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
