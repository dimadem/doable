
import { supabase } from '@/integrations/supabase/client';
import { SessionSelection, Personality } from '../types';
import { toast } from '@/hooks/use-toast';

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
      toast({
        title: "Error",
        description: 'Could not determine personality type',
        variant: "destructive"
      });
      return false;
    }

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        session_data: {
          selections,
          finalPersonality: personalityName
        },
        personality_key: personality.name
      });

    if (sessionError) {
      toast({
        title: "Error",
        description: 'Failed to save session data',
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Success",
      description: `Your personality type: ${personalityName}`
    });
    return true;
  } catch (error) {
    toast({
      title: "Error",
      description: 'An error occurred while saving the session',
      variant: "destructive"
    });
    return false;
  }
};
