
import { supabase } from "@/integrations/supabase/client";
import { SessionSelection } from '@/features/vibe-matching/types';
import { retryWithBackoff } from '@/utils/retryUtils';

export const createSession = async (sessionId: string) => {
  const { error } = await supabase
    .from('user_sessions')
    .insert({
      session_id: sessionId,
      started_at: new Date().toISOString(),
      session_data: {},
      device_info: {}
    });

  if (error) throw error;
  return true;
};

export const validateSessionInDb = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('started_at')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return data?.started_at;
};

export const updatePersonalityData = async (
  sessionId: string,
  personalityKey: string,
  selections: SessionSelection[]
) => {
  const { error } = await supabase
    .from('user_sessions')
    .update({
      personality_key: personalityKey,
      session_data: {
        selections: selections.map(s => ({
          step: s.step,
          personalityName: s.personalityName
        })),
        finalPersonality: personalityKey
      }
    })
    .eq('session_id', sessionId);

  if (error) throw error;
};

export const initializeSession = async (sessionId: string) => {
  return retryWithBackoff(
    () => createSession(sessionId),
    3,
    200
  );
};
