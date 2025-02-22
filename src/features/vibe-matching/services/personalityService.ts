
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
    console.log('Raw Input:', {
      personalityName,
      selections,
      personalities
    });

    const personality = personalities.find(p => p.name === personalityName);
    
    if (!personality) {
      toast({
        title: "Error",
        description: 'Could not determine personality type',
        variant: "destructive"
      });
      return false;
    }

    // Convert session data to a JSON-compatible format
    const sessionData = {
      selections: selections.map(selection => ({
        step: selection.step,
        personalityName: selection.personalityName
      })),
      finalPersonality: personalityName
    };

    console.log('Session Data Before Stringify:', sessionData);

    const dataToInsert = {
      session_data: JSON.stringify(sessionData),
      personality_key: personality.name,
      personality_id: personality.id
    };

    console.log('Data Being Sent to Supabase:', dataToInsert);

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert(dataToInsert);

    if (sessionError) {
      console.error('Supabase Error:', sessionError);
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
    console.error('Save Session Error:', error);
    toast({
      title: "Error",
      description: 'An error occurred while saving the session',
      variant: "destructive"
    });
    return false;
  }
};
