
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layouts/PageHeader';
import { pageVariants, pulseVariants } from '../animations/pageTransitions';
import type { StatusIndicatorProps, WaveformVisualizationProps } from '../types/vibe';

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusColors = {
    idle: 'bg-purple-500',
    connecting: 'bg-blue-500',
    processing: 'bg-orange-500',
    responding: 'bg-green-500'
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
      <span className="font-mono text-sm text-gray-400">{status}</span>
    </div>
  );
};

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({ isActive }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex items-center gap-1 h-full">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-white/30"
          animate={{
            height: isActive ? [20, 40 + Math.random() * 40, 20] : 20,
          }}
          transition={{
            duration: 0.5,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  </div>
);

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
