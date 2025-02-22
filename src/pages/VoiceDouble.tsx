
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pause, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Animation variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { 
      duration: 0.3 
    }
  }
};

const pulseVariants = {
  idle: {
    scale: [1, 1.02, 1],
    opacity: [0.5, 0.7, 0.5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  active: {
    scale: [1, 1.05, 1],
    opacity: [0.6, 0.9, 0.6],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Components
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
  >
    <ArrowLeft size={20} />
    <span className="font-mono">back</span>
  </button>
);

const StatusIndicator: React.FC<{ status: 'idle' | 'connecting' | 'processing' | 'responding' }> = ({ status }) => {
  const statusColors = {
    idle: 'bg-purple-500',
    connecting: 'bg-blue-500',
    processing: 'bg-orange-500',
    responding: 'bg-green-500'
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
      <span className="font-mono text-sm text-gray-400">{status}</span>
    </div>
  );
};

const WaveformVisualization: React.FC<{ isActive: boolean }> = ({ isActive }) => (
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
  const [status, setStatus] = useState<'idle' | 'connecting' | 'processing' | 'responding'>('idle');
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);

  return (
    <motion.div 
      className="h-screen bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <header className="p-8 flex justify-between items-center">
        <BackButton onClick={() => navigate('/vibe-matching')} />
        <h1 className="font-mono text-lg px-4 py-2 bg-white text-black">voice double</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative">
          {/* Central Orb */}
          <motion.div
            className="relative w-64 h-64 rounded-full flex items-center justify-center"
            variants={pulseVariants}
            animate={status === 'idle' ? 'idle' : 'active'}
          >
            {/* Multi-layer borders */}
            <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-[pulse_4s_ease-in-out_infinite]" />
            <div className="absolute inset-2 rounded-full border-2 border-white/20 animate-[pulse_4s_ease-in-out_infinite_1000ms]" />
            <div className="absolute inset-4 rounded-full border border-white/30 animate-[pulse_4s_ease-in-out_infinite_2000ms]" />
            
            {/* Waveform */}
            <WaveformVisualization isActive={status === 'responding'} />
            
            {/* Emergency Stop Button */}
            <AnimatePresence>
              {isEmergencyStop && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-red-500/90 rounded-full"
                >
                  <AlertOctagon className="w-12 h-12" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Central Button */}
            <button
              onClick={() => {
                if (status === 'idle') {
                  setStatus('connecting');
                  setTimeout(() => setStatus('processing'), 2000);
                  setTimeout(() => setStatus('responding'), 4000);
                } else {
                  setIsEmergencyStop(true);
                  setStatus('idle');
                  setTimeout(() => setIsEmergencyStop(false), 1000);
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

          {/* Status Indicator */}
          <StatusIndicator status={status} />
        </div>
      </main>
    </motion.div>
  );
};

export default VoiceDouble;
