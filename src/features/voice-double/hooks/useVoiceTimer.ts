
import { useState, useRef, useCallback, useEffect } from 'react';
import { sessionLogger } from '@/utils/sessionLogger';
import { TimerState } from '../types/timer';
import { toast } from '@/components/ui/use-toast';

interface UseVoiceTimerProps {
  currentTask: string | undefined;
  sessionId: string | null;
  onTimerComplete?: () => void;
}

export const useVoiceTimer = ({ 
  currentTask, 
  sessionId,
  onTimerComplete 
}: UseVoiceTimerProps) => {
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

    // Reset timer state and duration
    setTimerState(prev => ({ ...prev, isRunning: false, remainingTime: 0 }));
    setTimerDuration(0);
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = undefined;
    }

    // Notify agent of completion
    onTimerComplete?.();

    toast({
      title: "Timer Completed",
      description: currentTask ? `Task "${currentTask}" timer has ended` : "Timer has ended"
    });
  }, [currentTask, sessionId, onTimerComplete]);

  useEffect(() => {
    if (timerState.isRunning && timerState.remainingTime !== undefined && timerState.remainingTime > 0) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }

      timerInterval.current = setInterval(() => {
        setTimerState(prev => {
          const newRemainingTime = prev.remainingTime ? prev.remainingTime - 1 : 0;
          
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
      remainingTime: seconds,
      isRunning: false // Reset running state when duration changes
    }));
    
    sessionLogger.info('Timer duration set', { 
      minutes, 
      seconds, 
      sessionId 
    });
  }, [sessionId]);

  const setTimerRunning = useCallback((isRunning: boolean) => {
    // Can't start timer without duration
    if (isRunning && timerDuration <= 0) {
      sessionLogger.warn('Cannot start timer without duration', { 
        timerDuration,
        sessionId 
      });
      return false;
    }

    // Update timer state
    setTimerState(prev => ({
      ...prev,
      isRunning,
      startedAt: isRunning ? new Date().toISOString() : undefined,
      // If starting timer, ensure remainingTime is set from duration
      remainingTime: isRunning && prev.remainingTime === 0 ? timerDuration * 60 : prev.remainingTime
    }));

    sessionLogger.info('Timer state updated', { 
      isRunning,
      sessionId 
    });

    return true;
  }, [timerDuration, sessionId]);

  const cleanup = useCallback(() => {
    isCleaningUp.current = true;
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = undefined;
    }
    isCleaningUp.current = false;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    timerState,
    timerDuration,
    setTimerDurationMinutes,
    setTimerRunning,
    cleanup
  };
};
