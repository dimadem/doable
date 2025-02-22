
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
  >
    <ArrowLeft size={20} />
    <span className="font-mono">back</span>
  </button>
);

const VoiceDouble: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="h-screen bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <header className="p-8 flex justify-between items-center">
        <BackButton onClick={() => navigate('/')} />
        <h1 className="font-mono text-lg px-4 py-2 bg-white text-black">voice double</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="w-full max-w-md space-y-8">
          <div className="bg-white/5 p-8 rounded-lg border border-white/10">
            <h2 className="font-mono text-xl mb-4">create your voice double</h2>
            <p className="text-gray-400 mb-6">
              record your voice and create a digital voice clone that sounds just like you
            </p>
            <button 
              className="w-full py-3 px-4 bg-white text-black font-mono hover:bg-white/90 transition-colors"
            >
              start recording
            </button>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default VoiceDouble;
