
import { sessionLogger } from '@/utils/sessionLogger';
import { SESSION_CONTEXT_KEY } from '../constants/voice';
import { TimerState } from '../types/timer';
import { SessionContext } from '../types';

export const saveVoiceContext = (
  taskDescription: string,
  struggleType: string | undefined,
  timerDuration: number,
  timerState: TimerState,
  sessionId: string | null
) => {
  sessionLogger.info('Updating task context', {
    taskDescription,
    sessionId,
    struggleType,
    timestamp: new Date().toISOString()
  });

  const context: SessionContext = {
    taskDescription,
    struggleType,
    lastUpdate: new Date().toISOString(),
    timer: {
      duration: timerDuration,
      state: timerState
    }
  };
  
  localStorage.setItem(SESSION_CONTEXT_KEY, JSON.stringify(context));
  
  sessionLogger.info('Task context saved successfully', {
    taskDescription,
    sessionId,
    struggleType,
    timerContext: context.timer
  });

  return context;
};

export const loadVoiceContext = (sessionId: string | null): SessionContext | null => {
  const saved = localStorage.getItem(SESSION_CONTEXT_KEY);
  if (saved) {
    const context = JSON.parse(saved);
    sessionLogger.info('Loading saved task context', {
      savedTask: context.taskDescription,
      timerContext: context.timer,
      sessionId,
      timestamp: new Date().toISOString()
    });
    return context;
  }
  sessionLogger.info('No saved task context found', { sessionId });
  return null;
};
