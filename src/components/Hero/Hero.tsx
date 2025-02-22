
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleStart = () => {
    navigate('/vibe-matching');
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-black text-white" 
      initial="hidden" 
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {/* Progress Indicator */}
      <div className="fixed top-8 right-8 flex gap-2">
        {[1, 2, 3].map((step, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${
              i === 0 ? 'bg-white' : 'bg-gray-800'
            }`} 
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div 
        variants={itemVariants} 
        className="text-center mb-12"
      >
        <span className="font-mono text-sm tracking-wider text-gray-400 mb-4 block">
          just do it
        </span>
        <h1 className="font-mono font-bold mb-6 md:text-9xl text-7xl text-white">
          doable
        </h1>
        <p className="font-mono text-lg text-gray-400 max-w-md mx-auto">
          Uncover your authentic personality archetype through our innovative discovery process.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button 
        variants={itemVariants} 
        onClick={handleStart}
        className={`
          font-mono px-8 py-4 
          bg-black text-white 
          border-2 border-white 
          font-bold text-lg
          transition-all duration-300
          hover:bg-white hover:text-black
        `}
      >
        START
      </motion.button>

      {/* Scroll Indicator */}
      <motion.div 
        variants={itemVariants} 
        className="absolute bottom-8 animate-bounce"
      >
        <ChevronDown className="text-gray-600" />
      </motion.div>
    </motion.div>
  );
};

export default Hero;
