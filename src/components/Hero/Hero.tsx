
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from '../auth/AuthDialog';
import { pageVariants } from '@/animations/pageTransitions';

const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const direction = (location.state as { direction?: number })?.direction || 1;

  const handleStart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/vibe-matching', { state: { direction: 1 } });
    } else {
      setShowAuthDialog(true);
    }
  };

  return (
    <motion.div 
      className="min-h-[100svh] flex flex-col items-center justify-center px-4 bg-black text-white" 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      custom={direction}
    >
      <div className="fixed top-8 right-8 flex gap-2">
        {[1, 2, 3].map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-800'}`} 
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
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
          Start Journey
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-8"
      >
        <ChevronDown className="text-gray-600 animate-bounce" />
      </motion.div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </motion.div>
  );
};

export default Hero;
