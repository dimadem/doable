
import { useState, useCallback } from 'react';
import { SessionSelection } from '../types';
import { MAX_STEPS } from '../constants';

export const useVibeState = () => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<SessionSelection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectVibe = useCallback((personalityName: string) => {
    setSelections(prev => [...prev, { step, personalityName }]);
    setStep(prev => prev + 1);
    setError(null);
  }, [step]);

  const reset = useCallback(() => {
    setStep(0);
    setSelections([]);
    setError(null);
  }, []);

  return {
    step,
    selections,
    error,
    isComplete: step >= MAX_STEPS,
    selectVibe,
    setError,
    reset
  };
};
