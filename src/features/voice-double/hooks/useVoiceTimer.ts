
import { useState, useRef, useCallback, useEffect } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';
import { TimerState } from '../types/timer';
import { toast } from '@/components/ui/use-toast';

export const useVoiceTimer = (currentTask: string | undefined, sessionId: string | null) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    remainingTime: 0
  });
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const timerInterval = useRef<NodeJS.Timeout>();
  const isCleaningUp = useRef(false);

  const handleTimerEnd = useCallback(() => {
    sessionLogger.info('Timer completed', {
      taskDescription: currentTask,
      sessionId,
      timestamp: new Date().toISOString()
    });

    setTimerState(prev => ({ ...prev, isRunning: false, remainingTime: 0 }));
    toast({
      title: "Timer Completed",
      description: `Task "${currentTask}" timer has ended`
    });

    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = undefined;
    }
  }, [currentTask, sessionId]);

  useEffect(() => {
    if (timerState.isRunning && timerState.remainingTime && timerState.remainingTime > 0) {
      // Clear any existing interval
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }

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
        if (timerInterval.current && !isCleaningUp.current) {
          clearInterval(timerInterval.current);
        }
      };
    }
  }, [timerState.isRunning, handleTimerEnd, timerState.remainingTime]);

  const setTimerDurationMinutes = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setTimerDuration(minutes);
    setTimerState(prev => ({
      ...prev,
      remainingTime: seconds
    }));
  }, []);

  const setTimerRunning = useCallback((isRunning: boolean) => {
    if (isRunning && timerDuration <= 0) {
      return false;
    }

    setTimerState(prev => ({
      ...prev,
      isRunning,
      startedAt: isRunning ? new Date().toISOString() : undefined,
      remainingTime: isRunning ? prev.remainingTime : prev.remainingTime
    }));

    return true;
  }, [timerDuration]);

  const cleanup = useCallback(() => {
    isCleaningUp.current = true;
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = undefined;
    }
    isCleaningUp.current = false;
  }, []);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return {
    timerState,
    timerDuration,
    setTimerDurationMinutes,
    setTimerRunning,
    cleanup
  };
};
