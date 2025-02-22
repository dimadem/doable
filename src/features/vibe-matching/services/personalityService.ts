
import { supabase } from '@/integrations/supabase/client';
import { SessionSelection, Personality } from '../types';
import { toast } from '@/hooks/use-toast';

export const determinePersonality = (selections: SessionSelection[]): string => {
  const counts = selections.reduce((acc, curr) => {
    acc[curr.personalityName] = (acc[curr.personalityName] || 0) + 1;
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
  dominantPersonality: string,
  selections: SessionSelection[],
  personalities: Personality[]
): Promise<void> => {
  try {
    const matchingPersonality = personalities.find(p => p.name === dominantPersonality);
    if (!matchingPersonality) {
      throw new Error('No matching personality found');
    }

    const { error } = await supabase
      .from('user_sessions')
      .insert({
        personality_key: dominantPersonality,
        session_data: {
          selections,
          finalPersonality: dominantPersonality
        },
        started_at: new Date().toISOString()
      });

    if (error) throw error;

    toast({
      title: "Success",
      description: `Your personality type: ${dominantPersonality}`
    });
  } catch (error) {
    console.error('Error saving session:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to save session',
      variant: "destructive"
    });
    throw error;
  }
};
