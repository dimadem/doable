
import React from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/vibe/BackButton';
import { LogoutButton } from '../components/auth/LogoutButton';

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

const Struggle = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <header className="p-8 flex justify-between items-center">
        <BackButton onClick={() => navigate('/vibe-matching')} />
        <h1 className="font-mono text-lg px-4 py-2 bg-white text-black">struggle</h1>
        <LogoutButton />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <motion.button
          onClick={() => navigate('/voice-double')}
          className="relative flex flex-col items-center justify-center w-64 h-64"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
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
          <Square className="w-16 h-16 mb-4" />
          <span className="font-mono text-xl">Hard Task</span>
        </motion.button>
      </main>
    </motion.div>
  );
};

export default Struggle;
