
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layouts/PageHeader';
import { pageVariants, pulseVariants } from '@/animations/pageTransitions';
import { StatusIndicator } from '../components/StatusIndicator';
import { WaveformVisualization } from '../components/WaveformVisualization';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import type { StatusIndicatorProps } from '../types';
import { useToast } from '@/hooks/use-toast';

const ALLOWED_PERSONALITIES = ['emotive', 'hyperthymic', 'persistent_paranoid'];
const DEFAULT_PERSONALITY = 'persistent_paranoid';

const VoiceDouble: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const personalityParam = searchParams.get('personality');
  const personalityKey = ALLOWED_PERSONALITIES.includes(personalityParam || '') 
    ? personalityParam 
    : DEFAULT_PERSONALITY;

  const direction = (location.state as { direction?: number })?.direction || 1;
  const [status, setStatus] = useState<StatusIndicatorProps['status']>('idle');
  const { toast } = useToast();

  const { data: voiceConfig, isLoading, error } = useVoiceAgent(personalityKey);

  if (error) {
    console.error('Error loading voice configuration:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load voice configuration. Please try again.",
    });
  }

  return (
    <motion.div 
      className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      custom={direction}
    >
      <PageHeader 
        title="voice double"
        onBack={() => navigate('/struggle', { state: { direction: -1 } })}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-8">
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

            <button
              onClick={() => {
                if (status === 'idle') {
                  if (!voiceConfig) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Voice configuration not loaded yet. Please wait.",
                    });
                    return;
                  }
                  setStatus('connecting');
                  setTimeout(() => setStatus('processing'), 2000);
                  setTimeout(() => setStatus('responding'), 4000);
                } else {
                  setStatus('idle');
                }
              }}
              disabled={isLoading || !voiceConfig}
              className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center 
                       hover:bg-white/10 transition-colors border border-white/20 z-10
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'idle' ? (
                <span className="font-mono text-sm">
                  {isLoading ? 'loading...' : 'start'}
                </span>
              ) : (
                <Pause className="w-8 h-8" />
              )}
            </button>
          </motion.div>

          <StatusIndicator status={status} />
        </div>

        {voiceConfig && (
          <div className="mt-8 text-center">
            <p className="font-mono text-sm text-white/60">
              Voice Agent: {voiceConfig.voice_name || 'Default'}
            </p>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default VoiceDouble;
