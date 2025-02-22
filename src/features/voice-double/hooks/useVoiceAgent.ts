
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceAgent = (personalityKey: string) => {
  return useQuery({
    queryKey: ['voice-agent', personalityKey],
    queryFn: async () => {
      // Get voice configuration from the voices table
      const voiceConfig = await supabase
        .from('voices')
        .select('voice_name, agent_id, agent_settings')
        .eq('fit_personality_name', personalityKey)
        .maybeSingle();

      if (voiceConfig.error) {
        console.error('Error fetching voice configuration:', voiceConfig.error);
        throw new Error('Failed to fetch voice configuration');
      }

      if (!voiceConfig.data) {
        throw new Error(`No voice configuration found for personality: ${personalityKey}`);
      }

      // Get the API key from environment secrets
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'ELEVEN_LABS_API_KEY')
        .single();

      if (secretError) {
        console.error('Error fetching API key:', secretError);
        throw new Error('Failed to fetch API key');
      }

      return {
        ...voiceConfig.data,
        api_key: secretData?.value
      };
    },
    enabled: !!personalityKey,
    retry: 1, // Only retry once to avoid excessive attempts
  });
};
