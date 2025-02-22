
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const imageGroups = {
  initial: [
    'photo-1472396961693-142e6e269027',
    'photo-1509316975850-ff9c5deb0cd9',
    'photo-1482938289607-e9573fc25ebb'
  ],
  group1: [
    'photo-1488590528505-98d2b5aba04b',
    'photo-1531297484001-80022131f5a1',
    'photo-1487058792275-0ad4aaf24ca7'
  ],
  group2: [
    'photo-1486718448742-163732cd1544',
    'photo-1439337153520-7082a56a81f4',
    'photo-1497604401993-f2e922e5cb0a'
  ],
  group3: [
    'photo-1482938289607-e9573fc25ebb',
    'photo-1509316975850-ff9c5deb0cd9',
    'photo-1472396961693-142e6e269027'
  ]
};

const VibeMatching = () => {
  const navigate = useNavigate();
  const [currentGroup, setCurrentGroup] = useState<'initial' | 'group1' | 'group2' | 'group3'>('initial');
  const [step, setStep] = useState(1);

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

  const handleImageClick = (index: number) => {
    if (step < 3) {
      setStep(step + 1);
      setCurrentGroup(`group${step}` as keyof typeof imageGroups);
    } else {
      // Handle completion - for now, just go back to home
      navigate('/');
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
        {[1, 2, 3].map((s, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${
              i + 1 <= step ? 'bg-white' : 'bg-gray-800'
            }`} 
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto mt-32">
        <h1 className="font-mono text-5xl font-bold mb-8 text-center">
          Choose Your Vibe
        </h1>
        <p className="font-mono text-gray-400 text-center mb-12">
          Select the image that resonates most with you. {step}/3
        </p>
        
        {/* Image Grid */}
        <div className="space-y-6">
          {imageGroups[currentGroup].map((imageId, index) => (
            <motion.div
              key={imageId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleImageClick(index)}
              className="w-full aspect-video relative overflow-hidden rounded-lg cursor-pointer group"
            >
              <img
                src={`https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=800`}
                alt={`Choice ${index + 1}`}
                className="w-full h-full object-cover filter grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default VibeMatching;
