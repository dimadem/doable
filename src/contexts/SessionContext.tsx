
import React, { createContext, useContext, useEffect } from 'react';
import { SessionContextType } from './types/session.types';
import { useSessionState } from '@/features/session/hooks/useSessionState';
import { validateSession, initializeStoredSession } from '@/features/session/services/sessionValidation';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { state, setState, startSession, setPersonalityData, endSession } = useSessionState();

  useEffect(() => {
    const init = async () => {
      const initialState = await initializeStoredSession();
      setState(initialState);
    };

    init();
  }, [setState]);

  const handleValidateSession = async () => {
    return await validateSession(state.sessionId);
  };

  return (
    <SessionContext.Provider value={{
      ...state,
      startSession,
      endSession,
      setPersonalityData,
      validateSession: handleValidateSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
