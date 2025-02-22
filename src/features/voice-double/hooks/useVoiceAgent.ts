
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface VoiceConfig {
  voice_name: string;
  agent_id: string;
  agent_settings: Json;
  api_key?: string;
}

export const useVoiceAgent = (personalityKey: string) => {
  return useQuery({
    queryKey: ['voice-agent', personalityKey],
    queryFn: async (): Promise<VoiceConfig> => {
      // Get voice configuration
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

      // Get API key using edge function
      const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('get-eleven-labs-key');
      
      if (apiKeyError) {
        console.error('Error fetching API key:', apiKeyError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch API key. Please try again later.",
        });
        throw new Error('Failed to fetch API key');
      }

      return {
        ...voiceConfig.data,
        api_key: apiKeyData.apiKey
      };
    },
    enabled: !!personalityKey,
    retry: 1
  });
};
