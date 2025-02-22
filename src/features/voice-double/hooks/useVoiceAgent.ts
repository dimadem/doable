
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceAgent = (personalityKey: string) => {
  return useQuery({
    queryKey: ['voice-agent', personalityKey],
    queryFn: async () => {
      // Get voice configuration and API key in parallel for better performance
      const [voiceConfig, secretResult] = await Promise.all([
        supabase
          .from('voices')
          .select('voice_name, agent_id, agent_settings')
          .eq('fit_personality_name', personalityKey)
          .maybeSingle(),
        supabase.rpc('get_secret', { secret_name: 'ELEVEN_LABS_API_KEY' })
      ]);

      if (voiceConfig.error) {
        console.error('Error fetching voice configuration:', voiceConfig.error);
        throw voiceConfig.error;
      }

      if (secretResult.error) {
        console.error('Error fetching API key:', secretResult.error);
        throw secretResult.error;
      }

      return {
        ...voiceConfig.data,
        api_key: secretResult.data
      };
    },
    enabled: !!personalityKey,
  });
};
