
import { supabase } from '@/integrations/supabase/client';
import { SessionResponse, PersonalityAnalysis } from '../types';
import { sessionLogger } from '@/utils/sessionLogger';

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
    sessionLogger.error('Failed to fetch session data', sessionError);
    throw new Error('Failed to fetch session data');
  }

  return sessionData as unknown as SessionResponse;
};

export type StruggleType = 'pomodoro' | 'hard_task' | 'deep_focus';

const getVoiceForPersonality = async (personalityName: string) => {
  const { data, error } = await supabase
    .from('voices')
    .select('voice_name')
    .eq('fit_personality_name', personalityName)
    .maybeSingle();

  if (error) {
    sessionLogger.error('Error fetching voice', error);
    throw new Error(`Failed to fetch voice for personality: ${error.message}`);
  }

  return data;
};

export const updateSessionStruggleType = async (
  sessionId: string,
  struggleType: StruggleType,
  personalityName: string,
  personalityData?: PersonalityAnalysis
): Promise<void> => {
  sessionLogger.info('Updating session struggle type', {
    sessionId,
    struggleType,
    personalityName
  });

  // First get the matching voice
  const matchingVoice = await getVoiceForPersonality(personalityName);
  
  // Prepare session data update
  const updateData = {
    struggle_type: struggleType,
    relevant_agent: matchingVoice?.voice_name || null,
    started_at: new Date().toISOString(),
    personality_key: personalityName,
    session_data: personalityData ? {
      ...personalityData,
      updatedAt: new Date().toISOString()
    } : undefined
  };

  const { error } = await supabase
    .from('user_sessions')
    .update(updateData)
    .eq('session_id', sessionId);

  if (error) {
    sessionLogger.error('Supabase error updating session', error);
    throw new Error(`Failed to update session: ${error.message}`);
  }

  sessionLogger.info('Session updated successfully', {
    sessionId,
    struggleType,
    personalityName
  });
};
