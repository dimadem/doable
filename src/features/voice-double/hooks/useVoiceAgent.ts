
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceAgent = (personalityKey: string) => {
  return useQuery({
    queryKey: ['voice-agent', personalityKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voices')
        .select('voice_name, api_key, agent_id, agent_settings')
        .eq('fit_personality_name', personalityKey)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!personalityKey,
  });
};
