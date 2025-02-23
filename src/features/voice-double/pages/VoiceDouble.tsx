
import React from 'react';
import { motion } from 'framer-motion';
import { Pause, Mic } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useConversation } from '@11labs/react';
import { AppHeader } from '@/components/layouts/AppHeader';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { useToast } from '@/hooks/use-toast';
import type { StatusIndicatorProps } from '../types';

const ALLOWED_PERSONALITIES = ['emotive', 'hyperthymic', 'persistent_paranoid'];
const DEFAULT_PERSONALITY = 'persistent_paranoid';

const VoiceDouble: React.FC = () => {
  const [searchParams] = useSearchParams();
  const personalityParam = searchParams.get('personality');
  const personalityKey = ALLOWED_PERSONALITIES.includes(personalityParam || '') 
    ? personalityParam 
    : DEFAULT_PERSONALITY;

  const { toast } = useToast();
  const [status, setStatus] = React.useState<StatusIndicatorProps['status']>('idle');

  const { data: voiceConfig, isLoading, error } = useVoiceAgent(personalityKey);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice connection established');
      setStatus('connected');
    },
    onDisconnect: () => {
      console.log('Voice connection disconnected');
      setStatus('idle');
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect to voice service",
      });
      setStatus('idle');
    }
  });

  const handleInteractionToggle = async () => {
    if (status === 'idle') {
      if (!voiceConfig?.api_key || !voiceConfig?.agent_id || !voiceConfig?.agent_settings?.tts?.voice_id) {
        console.error('Missing voice configuration:', {
          hasApiKey: !!voiceConfig?.api_key,
          hasAgentId: !!voiceConfig?.agent_id,
          hasVoiceId: !!voiceConfig?.agent_settings?.tts?.voice_id
        });
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Voice service not configured properly",
        });
        return;
      }

      try {
        setStatus('connecting');
        console.log('Starting voice session with:', {
          agentId: voiceConfig.agent_id,
          voiceId: voiceConfig.agent_settings.tts.voice_id
        });

        await conversation.startSession({
          agentId: voiceConfig.agent_id,
          overrides: {
            tts: {
              voiceId: voiceConfig.agent_settings.tts.voice_id
            }
          }
        });
      } catch (err) {
        console.error('Voice interaction error:', err);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to start voice interaction",
        });
        setStatus('idle');
      }
    } else {
      console.log('Ending voice session');
      await conversation.endSession();
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden">
      <AppHeader title="voice double" />

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        {isLoading ? (
          <div className="text-white/60 font-mono">Loading voice configuration...</div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <motion.button
              onClick={handleInteractionToggle}
              disabled={isLoading || !voiceConfig}
              className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center 
                       hover:bg-white/10 transition-colors border border-white/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === 'idle' ? (
                <Mic className="w-8 h-8" />
              ) : (
                <Pause className="w-8 h-8" />
              )}
            </motion.button>

            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-sm text-white/60">
                {voiceConfig?.voice_name || 'Default Voice'}
              </p>
              <p className="font-mono text-xs text-white/40">
                Status: {status}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VoiceDouble;
