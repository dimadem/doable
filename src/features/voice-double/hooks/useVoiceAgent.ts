
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceAgent = (personalityKey: string) => {
  return useQuery({
    queryKey: ['voice-agent', personalityKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voices')
        .select('voice_name, agent_id, agent_settings')
        .eq('fit_personality_name', personalityKey)
        .maybeSingle();

      if (error) {
        console.error('Error fetching voice configuration:', error);
        throw error;
      }

      // Get the API key from environment variable (set via Supabase secrets)
      const { data: api_key } = await supabase
        .functions.invoke('get-eleven-labs-key', {
          method: 'POST'
        });

      if (!api_key) {
        throw new Error('ElevenLabs API key not found');
      }

      return {
        ...data,
        api_key
      };
    },
    enabled: !!personalityKey,
  });
};
