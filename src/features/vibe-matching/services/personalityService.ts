
import { supabase } from '@/integrations/supabase/client';
import { SessionSelection, Personality, SessionData } from '../types';
import { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionContext';

const ALLOWED_PERSONALITIES = ['emotive', 'hyperthymic', 'persistent_paranoid'];

export const determinePersonality = (selections: SessionSelection[]): string => {
  // Count selections for each personality
  const counts = selections.reduce((acc, curr) => {
    acc[curr.personalityName] = (acc[curr.personalityName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Selection counts:', counts);

  // Find the personality with the most selections
  let maxCount = 0;
  let dominantPersonality = '';
  let hasTie = false;

  Object.entries(counts).forEach(([personality, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantPersonality = personality;
      hasTie = false;
    } else if (count === maxCount) {
      hasTie = true;
    }
  });

  // If there's a tie, use the last selection as a tiebreaker
  if (hasTie) {
    dominantPersonality = selections[selections.length - 1].personalityName;
    console.log('Tie resolved using last selection:', dominantPersonality);
  }

  return dominantPersonality;
};

export const saveUserSession = async (
  dominantPersonality: string,
  selections: SessionSelection[],
  personalities: Personality[]
): Promise<void> => {
  try {
    console.log('Saving session with personality:', dominantPersonality);
    
    if (!ALLOWED_PERSONALITIES.includes(dominantPersonality)) {
      throw new Error('Invalid personality type');
    }

    const sessionData = {
      selections: selections.map(s => ({
        step: s.step,
        personalityName: s.personalityName
      })),
      finalPersonality: dominantPersonality
    };

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        personality_key: dominantPersonality,
        session_data: sessionData as Json,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Store personality data in localStorage using SessionContext
    const { setPersonalityData } = useSession();
    setPersonalityData(dominantPersonality, selections);

    console.log('Session saved successfully:', data);

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
