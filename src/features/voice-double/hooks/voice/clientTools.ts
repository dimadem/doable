
import { TimerState } from '../../types/voice';

export const createClientTools = (
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>,
  stopInteraction: () => Promise<void>,
  unmountingRef: React.RefObject<boolean>
) => ({
  set_timer_state: async ({ timer_on }: { timer_on: boolean }) => {
    if (unmountingRef.current) return;
    
    console.log('Setting timer state:', timer_on);
    setTimerState(prev => ({ ...prev, isRunning: timer_on }));
    return "Timer state updated";
  },
  
  set_timer_duration: async ({ timer_duration }: { timer_duration: number }) => {
    if (unmountingRef.current) return;
    
    console.log('Setting timer duration:', timer_duration);
    const durationInSeconds = timer_duration * 60;
    setTimerState(prev => ({
      ...prev,
      duration: timer_duration,
      remainingTime: durationInSeconds
    }));
    return "Timer duration set";
  },
  
  set_task: async ({ end_conversation = false }: { end_conversation?: boolean }) => {
    if (unmountingRef.current) return;
    
    if (end_conversation) {
      setTimerState(prev => ({ ...prev, isRunning: false }));
      await stopInteraction();
      return "Task completed and conversation ended";
    }
    
    return "Task handled";
  }
});
