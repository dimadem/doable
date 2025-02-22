
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
        throw new Error('Failed to fetch voice configuration');
      }

      if (!voiceConfig.data) {
        throw new Error(`No voice configuration found for personality: ${personalityKey}`);
      }

      if (secretResult.error) {
        console.error('Error fetching API key:', secretResult.error);
        throw new Error('Failed to fetch API key');
      }

      return {
        ...voiceConfig.data,
        api_key: secretResult.data as string
      };
    },
    enabled: !!personalityKey,
    retry: 1, // Only retry once to avoid excessive attempts
  });
};
