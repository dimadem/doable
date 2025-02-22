
import { supabase } from '@/integrations/supabase/client';
import { SessionSelection, Personality } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export const determinePersonality = (selections: SessionSelection[]): string => {
  const counts = selections.reduce((acc, selection) => {
    acc[selection.personalityName] = (acc[selection.personalityName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
  personalityName: string,
  selections: SessionSelection[],
  personalities: Personality[]
) => {
  try {
    const personality = personalities.find(p => p.name === personalityName);
    
    if (!personality) {
      throw new Error('Could not determine personality type');
    }

    const sessionData = {
      selections: selections.map(selection => ({
        step: selection.step,
        personalityName: selection.personalityName
      })),
      finalPersonality: personalityName
    };

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        personality_key: personalityName,
        session_data: sessionData as Json,
        started_at: new Date().toISOString()
      });

    if (sessionError) {
      console.error('Session save error:', sessionError);
      throw new Error('Failed to save session data');
    }

    return true;
  } catch (error) {
    console.error('Save session error:', error);
    throw error;
  }
};
