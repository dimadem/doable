
import { useCallback } from 'react';
import { useConversation } from '@11labs/react';

export const useVoiceVolume = () => {
  const conversation = useConversation();

  const setVoiceVolume = useCallback(async (volume: number) => {
    await conversation.setVolume({ volume });
  }, [conversation]);

  return { setVoiceVolume };
};
