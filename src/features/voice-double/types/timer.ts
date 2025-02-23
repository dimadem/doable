
export interface TimerState {
  isRunning: boolean;
  startedAt?: string;
  remainingTime?: number;
}

export interface TimerContext {
  duration: number;
  state: TimerState;
}
