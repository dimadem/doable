
import { useReducer, useCallback } from 'react';
import { SessionSelection, Personality } from '../types';
import { MAX_STEPS } from '../constants';

interface VibeState {
  step: number;
  selections: SessionSelection[];
  isComplete: boolean;
  error: string | null;
}

type VibeAction = 
  | { type: 'SELECT_VIBE'; payload: { step: number; personalityName: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: VibeState = {
  step: 0,
  selections: [],
  isComplete: false,
  error: null
};

function vibeReducer(state: VibeState, action: VibeAction): VibeState {
  switch (action.type) {
    case 'SELECT_VIBE':
      const newSelections = [
        ...state.selections,
        { step: action.payload.step, personalityName: action.payload.personalityName }
      ];
      const nextStep = state.step + 1;
      return {
        ...state,
        step: nextStep,
        selections: newSelections,
        isComplete: nextStep >= MAX_STEPS,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const useVibeState = () => {
  const [state, dispatch] = useReducer(vibeReducer, initialState);

  const selectVibe = useCallback((personalityName: string) => {
    dispatch({
      type: 'SELECT_VIBE',
      payload: { step: state.step, personalityName }
    });
  }, [state.step]);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    selectVibe,
    setError,
    reset
  };
};
