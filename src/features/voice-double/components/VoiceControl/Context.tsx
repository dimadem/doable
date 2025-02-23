
import React, { createContext, useContext } from 'react';
import { VoiceContextType } from '../../types/voice';

const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
};

export const VoiceProvider = VoiceContext.Provider;
