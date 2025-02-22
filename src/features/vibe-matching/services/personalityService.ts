
import { supabase } from '@/integrations/supabase/client';
import { SessionSelection, Personality } from '../types';

export const determinePersonality = (selections: SessionSelection[]): string => {
  // Count selections for each personality
  const counts = selections.reduce((acc, curr) => {
    acc[curr.personalityName] = (acc[curr.personalityName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find the personality with the most selections
  let maxCount = 0;
  let dominantPersonality = '';

  Object.entries(counts).forEach(([personality, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantPersonality = personality;
    }
  });

  return dominantPersonality;
};

export const saveUserSession = async (
  dominantPersonality: string,
  selections: SessionSelection[],
  personalities: Personality[]
) => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        personality_key: dominantPersonality,
        session_data: selections,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};
