
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VibeMatching = () => {
  const navigate = useNavigate();

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

  return (
    <motion.div 
      className="min-h-screen bg-black text-white p-8"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-mono">Back</span>
      </button>

      {/* Progress Indicator */}
      <div className="fixed top-8 right-8 flex gap-2">
        {[1, 2, 3].map((step, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${
              i === 1 ? 'bg-white' : 'bg-gray-800'
            }`} 
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto mt-32">
        <h1 className="font-mono text-5xl font-bold mb-8 text-center">
          Vibe Matching
        </h1>
        <p className="font-mono text-gray-400 text-center mb-12">
          Let's find out what makes you unique. Answer a few questions to discover your personality archetype.
        </p>
        
        {/* Placeholder for future vibe matching content */}
        <div className="space-y-8">
          <div className="border-2 border-gray-800 p-6 rounded-lg hover:border-white transition-colors">
            <h3 className="font-mono text-xl mb-4">Question 1</h3>
            <p className="font-mono text-gray-400">Coming soon...</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VibeMatching;
