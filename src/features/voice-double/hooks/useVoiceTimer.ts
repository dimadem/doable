
import { useState, useRef, useCallback, useEffect } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';
import { TimerState } from '../types/timer';
import { toast } from '@/components/ui/use-toast';

export const useVoiceTimer = (currentTask: string | undefined, sessionId: string | null) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false
  });
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const timerInterval = useRef<NodeJS.Timeout>();

  const handleTimerEnd = useCallback(() => {
    sessionLogger.info('Timer completed', {
      taskDescription: currentTask,
      sessionId,
      timestamp: new Date().toISOString()
    });

    setTimerState(prev => ({ ...prev, isRunning: false }));
    toast({
      title: "Timer Completed",
      description: `Task "${currentTask}" timer has ended`
    });

    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  }, [currentTask, sessionId]);

  useEffect(() => {
    if (timerState.isRunning && timerState.remainingTime && timerState.remainingTime > 0) {
      timerInterval.current = setInterval(() => {
        setTimerState(prev => {
          const newRemainingTime = (prev.remainingTime || 0) - 1;
          
          if (newRemainingTime <= 0) {
            handleTimerEnd();
            return { ...prev, isRunning: false, remainingTime: 0 };
          }
          
          return { ...prev, remainingTime: newRemainingTime };
        });
      }, 1000);

      return () => {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
      };
    }
  }, [timerState.isRunning, handleTimerEnd]);

  const setTimerDurationMinutes = useCallback((minutes: number) => {
    setTimerDuration(minutes);
    setTimerState(prev => ({
      ...prev,
      remainingTime: minutes * 60
    }));
  }, []);

  const setTimerRunning = useCallback((isRunning: boolean) => {
    if (isRunning && timerDuration <= 0) {
      return false;
    }

    setTimerState(prev => ({
      ...prev,
      isRunning,
      startedAt: isRunning ? new Date().toISOString() : undefined
    }));

    return true;
  }, [timerDuration]);

  const cleanup = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  }, []);

  return {
    timerState,
    timerDuration,
    setTimerDurationMinutes,
    setTimerRunning,
    cleanup
  };
};
