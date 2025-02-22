
import React from 'react';
import { ConversationContext } from '@11labs/react';

export const ElevenLabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConversationContext>
      {children}
    </ConversationContext>
  );
};
