
import { useRef } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';

type TimerTools = {
  setTimerState?: (isRunning: boolean) => Promise<void>;
  setTimerDuration?: (duration: number) => Promise<void>;
};

export const useVoiceClientTools = (wsReadyRef: React.RefObject<boolean>) => {
  const clientToolsRef = useRef<TimerTools>({});

  const handleSetTimerDuration = async ({ timer_duration }: { timer_duration: number }) => {
    if (!wsReadyRef.current) {
      return "WebSocket not ready";
    }
    
    sessionLogger.info('Timer duration update requested', { timer_duration });

    if (clientToolsRef.current.setTimerDuration) {
      await clientToolsRef.current.setTimerDuration(timer_duration);
    }

    return "Timer duration set successfully";
  };

  const handleSetTimerState = async ({ timer_on }: { timer_on: boolean }) => {
    if (!wsReadyRef.current) {
      return "WebSocket not ready";
    }

    if (clientToolsRef.current.setTimerState) {
      await clientToolsRef.current.setTimerState(timer_on);
      return "Timer state updated successfully";
    }

    return "Cannot update timer state";
  };

  const registerTimerTools = (
    setTimerState: (isRunning: boolean) => Promise<void>,
    setTimerDuration: (duration: number) => Promise<void>
  ) => {
    clientToolsRef.current = {
      setTimerState,
      setTimerDuration
    };
  };

  return {
    clientTools: {
      set_timer_duration: handleSetTimerDuration,
      set_timer_state: handleSetTimerState
    },
    registerTimerTools
  };
};
