'use client';

import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';

interface PomodoroTimerProps {
  defaultDuration?: number;
}

interface PomodoroTimerRef {
  setDuration: (minutes: number) => void;
  start: () => void;
  stop: () => void;
}

const PomodoroTimer = forwardRef<PomodoroTimerRef, PomodoroTimerProps>(({ defaultDuration = 25 }, ref) => {
  const [duration, setDuration] = useState(defaultDuration * 60);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useImperativeHandle(ref, () => ({
    setDuration: (minutes: number) => {
      const seconds = minutes * 60;
      setDuration(seconds);
      setTimeLeft(seconds);
    },
    start: () => {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsRunning(false);
    }
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-4xl font-mono">
      {formatTime(timeLeft)}
    </div>
  );
});

PomodoroTimer.displayName = 'PomodoroTimer';

export default PomodoroTimer;
