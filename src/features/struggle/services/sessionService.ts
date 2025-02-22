
import { supabase } from '@/integrations/supabase/client';
import { SessionResponse } from '../types';

export const fetchLatestSession = async (): Promise<SessionResponse> => {
  const { data: sessionData, error: sessionError } = await supabase
    .from('user_sessions')
    .select(`
      id,
      session_data,
      personality_key,
      personalities!user_sessions_personality_key_fkey (
        name,
        core_traits,
        behavior_patterns
      )
    `)
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (sessionError) {
    throw new Error('Failed to fetch session data');
  }

  return sessionData as unknown as SessionResponse;
};

export const updateSessionStartTime = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_sessions')
    .update({ started_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to update session start time: ${error.message}`);
  }
};

export type StruggleType = 'pomodoro' | 'hard_task' | 'deep_focus';

export const updateSessionStruggleType = async (
  sessionId: string,
  struggleType: StruggleType
): Promise<void> => {
  const { error } = await supabase
    .from('user_sessions')
    .update({ struggle_type: struggleType })
    .eq('id', sessionId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to update struggle type: ${error.message}`);
  }
};
