
import { supabase } from "@/integrations/supabase/client";
import { SessionSelection } from '@/features/vibe-matching/types';
import { retryWithBackoff } from '@/utils/retryUtils';

export const createSession = async (sessionId: string) => {
  console.log('Creating new session:', sessionId);
  
  const { error } = await supabase
    .from('user_sessions')
    .insert({
      session_id: sessionId,
      started_at: new Date().toISOString(),
      session_data: {},
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      }
    });

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }
  
  console.log('Session created successfully');
  return true;
};

export const validateSessionInDb = async (sessionId: string) => {
  console.log('Validating session:', sessionId);
  
  const { data, error } = await supabase
    .from('user_sessions')
    .select('started_at, session_data')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Session validation error:', error);
    throw error;
  }

  if (!data) {
    console.log('No session found for ID:', sessionId);
    return false;
  }

  // Check if session is expired (24 hours)
  const sessionStart = new Date(data.started_at).getTime();
  const currentTime = new Date().getTime();
  const sessionAge = currentTime - sessionStart;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  if (sessionAge > maxAge) {
    console.log('Session expired:', sessionId);
    return false;
  }

  console.log('Session validated successfully');
  return true;
};

export const updatePersonalityData = async (
  sessionId: string,
  personalityKey: string,
  selections: SessionSelection[]
) => {
  console.log('Updating personality data for session:', sessionId);
  
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
    console.error('Error updating personality data:', error);
    throw error;
  }

  console.log('Personality data updated successfully');
};

export const initializeSession = async (sessionId: string) => {
  console.log('Initializing session with retry:', sessionId);
  
  return retryWithBackoff(
    () => createSession(sessionId),
    3,
    200
  );
};
