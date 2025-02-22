
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layouts/PageHeader';
import { pageVariants, pulseVariants } from '@/animations/pageTransitions';
import { StatusIndicator } from '../components/StatusIndicator';
import { WaveformVisualization } from '../components/WaveformVisualization';
import type { StatusIndicatorProps } from '../types';

const VoiceDouble: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusIndicatorProps['status']>('idle');

  return (
    <motion.div 
      className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <PageHeader 
        title="voice double"
        onBack={() => navigate('/struggle')}
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
                  setStatus('connecting');
                  setTimeout(() => setStatus('processing'), 2000);
                  setTimeout(() => setStatus('responding'), 4000);
                } else {
                  setStatus('idle');
                }
              }}
              className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center 
                       hover:bg-white/10 transition-colors border border-white/20 z-10"
            >
              {status === 'idle' ? (
                <span className="font-mono text-sm">start</span>
              ) : (
                <Pause className="w-8 h-8" />
              )}
            </button>
          </motion.div>

          <StatusIndicator status={status} />
        </div>
      </main>
    </motion.div>
  );
};

export default VoiceDouble;
