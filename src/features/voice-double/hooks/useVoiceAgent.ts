
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { VoiceConfig, VoiceAgentSettings } from '../types';
import type { Json } from '@/integrations/supabase/types';

export const useVoiceAgent = (personalityKey: string) => {
  return useQuery({
    queryKey: ['voice-agent', personalityKey],
    queryFn: async (): Promise<VoiceConfig> => {
      console.log('Fetching voice configuration for:', personalityKey);
      
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
        console.error('No voice configuration found for:', personalityKey);
        throw new Error(`No voice configuration found for personality: ${personalityKey}`);
      }

      console.log('Voice configuration found:', voiceConfig.data);

      // Validate agent settings structure
      const agentSettings = voiceConfig.data.agent_settings as VoiceAgentSettings;
      if (!agentSettings?.tts?.voice_id) {
        console.error('Invalid voice configuration - missing voice ID:', agentSettings);
        throw new Error('Invalid voice configuration: missing voice ID');
      }

      console.log('Fetching API key...');
      const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('get-eleven-labs-key');
      
      if (apiKeyError) {
        console.error('Error fetching API key:', apiKeyError);
        throw new Error('Failed to fetch API key');
      }

      const config = {
        voice_name: voiceConfig.data.voice_name,
        agent_id: voiceConfig.data.agent_id,
        agent_settings: agentSettings,
        api_key: apiKeyData.apiKey
      };

      console.log('Voice configuration complete:', {
        hasVoiceName: !!config.voice_name,
        hasAgentId: !!config.agent_id,
        hasVoiceId: !!config.agent_settings.tts?.voice_id,
        hasApiKey: !!config.api_key
      });

      return config;
    },
    enabled: !!personalityKey,
    retry: 1
  });
};
