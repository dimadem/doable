
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Mic } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useConversation } from '@11labs/react';
import { AppHeader } from '@/components/layouts/AppHeader';
import { pageVariants, pulseVariants } from '@/animations/pageTransitions';
import { StatusIndicator } from '../components/StatusIndicator';
import { WaveformVisualization } from '../components/WaveformVisualization';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { useToast } from '@/hooks/use-toast';
import { ElevenLabsProvider } from '../providers/ElevenLabsProvider';
import type { StatusIndicatorProps } from '../types';

const ALLOWED_PERSONALITIES = ['emotive', 'hyperthymic', 'persistent_paranoid'];
const DEFAULT_PERSONALITY = 'persistent_paranoid';

const VoiceDoubleContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const personalityParam = searchParams.get('personality');
  const personalityKey = ALLOWED_PERSONALITIES.includes(personalityParam || '') 
    ? personalityParam 
    : DEFAULT_PERSONALITY;

  const direction = (location.state as { direction?: number })?.direction || 1;
  const { toast } = useToast();
  const [status, setStatus] = React.useState<StatusIndicatorProps['status']>('idle');

  const { data: voiceConfig, isLoading, error } = useVoiceAgent(personalityKey);

  const conversation = useConversation({
    onConnect: () => {
      setStatus('connected' as any);
    },
    onMessage: (msg) => {
      if (msg.type === 'audio') {
        setStatus('responding');
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect to voice service",
      });
      setStatus('idle');
    },
    onDisconnect: () => {
      setStatus('idle');
    }
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error loading voice configuration:', error);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Failed to load voice settings. Please try again.",
      });
    }
  }, [error, toast]);

  const handleInteractionToggle = async () => {
    if (status === 'idle') {
      if (!voiceConfig?.api_key || !voiceConfig?.agent_id) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Voice service not configured. Please check your settings.",
        });
        return;
      }

      try {
        setStatus('connecting');
        await conversation.startSession({
          agentId: voiceConfig.agent_id,
          overrides: {
            tts: {
              voiceId: voiceConfig.voice_name
            }
          }
        });
      } catch (err) {
        console.error('Voice interaction error:', err);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to start voice interaction. Please try again.",
        });
        setStatus('idle');
      }
    } else {
      await conversation.endSession();
      setStatus('idle');
    }
  };

  return (
    <motion.div 
      className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      custom={direction}
    >
      <AppHeader title="voice double" />

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/60 font-mono"
            >
              Loading voice configuration...
            </motion.div>
          ) : (
            <div className="relative">
              <motion.div
                className="relative w-64 h-64 rounded-full flex items-center justify-center"
                variants={pulseVariants}
                animate={status === 'idle' ? 'idle' : 'active'}
              >
                <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-[pulse_4s_ease-in-out_infinite]" />
                <div className="absolute inset-2 rounded-full border-2 border-white/20 animate-[pulse_4s_ease-in-out_infinite_1000ms]" />
                <div className="absolute inset-4 rounded-full border border-white/30 animate-[pulse_4s_ease-in-out_infinite_2000ms]" />
                
                <WaveformVisualization isActive={status === 'responding'} />

                <motion.button
                  onClick={handleInteractionToggle}
                  disabled={isLoading || !voiceConfig}
                  className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center 
                           hover:bg-white/10 transition-colors border border-white/20 z-10
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
              </motion.div>

              <StatusIndicator status={status} />
            </div>
          )}
        </AnimatePresence>

        <motion.div 
          className="mt-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-mono text-sm text-white/60">
            {voiceConfig?.voice_name || 'Default Voice'}
          </p>
          <p className="font-mono text-xs text-white/40">
            Status: {status}
          </p>
        </motion.div>
      </main>
    </motion.div>
  );
};

const VoiceDouble: React.FC = () => {
  return (
    <ElevenLabsProvider>
      <VoiceDoubleContent />
    </ElevenLabsProvider>
  );
};

export default VoiceDouble;
