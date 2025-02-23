
import { supabase } from '@/integrations/supabase/client';
import { SessionSelection } from '@/features/vibe-matching/types';
import { sessionLogger } from '@/utils/sessionLogger';

export const validateSessionInDb = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('session_id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    sessionLogger.error('Error validating session', { error, sessionId });
    return false;
  }

  return !!data;
};

export const initializeSession = async (sessionId: string) => {
  const { error } = await supabase
    .from('user_sessions')
    .insert({
      session_id: sessionId,
      started_at: new Date().toISOString()
    });

  if (error) {
    sessionLogger.error('Error initializing session', { error, sessionId });
    throw error;
  }

  return true;
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
        finalPersonality: personalityKey,
        updatedAt: new Date().toISOString()
      }
    })
    .eq('session_id', sessionId);

  if (error) {
    sessionLogger.error('Error updating personality data', { error, sessionId });
    throw error;
  }
};
