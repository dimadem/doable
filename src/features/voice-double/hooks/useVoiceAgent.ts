
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceAgent = (personalityKey: string) => {
  return useQuery({
    queryKey: ['voice-agent', personalityKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voices')
        .select('*')
        .eq('fit_personality_name', personalityKey)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!personalityKey,
  });
};
