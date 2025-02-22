
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
