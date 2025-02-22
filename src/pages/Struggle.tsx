
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pageVariants = {
  initial: { 
    opacity: 0, 
    x: 100 
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { 
      duration: 0.3 
    }
  }
};

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
  >
    <ArrowLeft size={20} />
    <span className="font-mono">back</span>
  </button>
);

const Struggle = () => {
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
        <BackButton onClick={() => navigate('/vibe-matching')} />
        <h1 className="font-mono text-lg px-4 py-2 bg-white text-black">struggle</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 border-2 border-white/20 rounded-lg"
            animate={{
              scale: [1, 1.05, 1],
              borderWidth: ["2px", "1px", "2px"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="font-mono text-xl">coming soon</span>
        </div>
      </main>
    </motion.div>
  );
};

export default Struggle;
