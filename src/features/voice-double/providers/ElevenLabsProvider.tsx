
import React from 'react';
import { ConversationProvider } from '@11labs/react';

export const ElevenLabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConversationProvider>
      {children}
    </ConversationProvider>
  );
};
