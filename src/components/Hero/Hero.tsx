
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '../layouts/AppHeader';
import { createLocalSession, getSessionData } from '@/utils/sessionUtils';

const Hero = () => {
  const navigate = useNavigate();
  const sessionData = getSessionData();

  const handleStart = () => {
    if (sessionData?.personalityData) {
      navigate('/struggle');
      return;
    }
    
    if (!sessionData?.sessionId) {
      createLocalSession();
    }
    
    navigate('/vibe-matching');
  };

  return (
    <motion.div 
      className="min-h-[100svh] flex flex-col items-center bg-black text-white"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <AppHeader showBack={false} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-32 mb-12"
      >
        <span className="font-mono text-sm tracking-wider text-gray-400 mb-4 block">
          just do it
        </span>
        <h1 className="font-mono font-bold mb-6 md:text-9xl text-7xl text-white">
          doable
        </h1>
        <p className="font-mono text-lg text-gray-400 max-w-md mx-auto mb-8">
          Uncover your authentic personality archetype through our innovative discovery process.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="group inline-flex items-center gap-2 font-mono px-8 py-4 bg-black text-white 
                   border-2 border-white font-bold text-lg transition-all duration-300 
                   hover:bg-white hover:text-black"
        >
          {sessionData?.personalityData ? 'Continue Journey' : 'Start Journey'}
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Hero;
