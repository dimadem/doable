
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from '../auth/AuthDialog';

const Hero = () => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleStart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/vibe-matching');
    } else {
      setShowAuthDialog(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="min-h-[100svh] flex flex-col items-center justify-center px-4 bg-black text-white" 
      initial="hidden" 
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <div className="fixed top-8 right-8 flex gap-2">
        {[1, 2, 3].map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-800'}`} 
          />
        ))}
      </div>

      <motion.div variants={itemVariants} className="text-center mb-12">
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
          variants={itemVariants}
          onClick={handleStart}
          className="group inline-flex items-center gap-2 font-mono px-8 py-4 bg-black text-white 
                   border-2 border-white font-bold text-lg transition-all duration-300 
                   hover:bg-white hover:text-black"
        >
          Start Journey
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="absolute bottom-8 animate-bounce">
        <ChevronDown className="text-gray-600" />
      </motion.div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </motion.div>
  );
};

export default Hero;
