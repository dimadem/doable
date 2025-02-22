
import { supabase } from '@/integrations/supabase/client';
import { SessionResponse } from '../types';

export const fetchLatestSession = async (): Promise<SessionResponse> => {
  const { data: sessionData, error: sessionError } = await supabase
    .from('user_sessions')
    .select(`
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
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour12: false });
  
  const { error } = await supabase
    .from('user_sessions')
    .update({ started_at: timeString })
    .eq('id', sessionId);

  if (error) {
    throw new Error('Failed to update session start time');
  }
};

