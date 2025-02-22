
import { supabase } from '../integrations/supabase/client';
import { SessionSelection, Personality } from '../types/vibe';
import { toast } from 'sonner';

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
      toast.error('Could not determine personality type');
      return false;
    }

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        session_data: JSON.stringify({
          selections,
          finalPersonality: personalityName
        }),
        personality_id: personality.id
      });

    if (sessionError) {
      toast.error('Failed to save session data');
      return false;
    }

    toast.success(`Your personality type: ${personalityName}`);
    return true;
  } catch (error) {
    toast.error('An error occurred while saving the session');
    return false;
  }
};
