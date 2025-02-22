
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
      className="h-screen bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Header Section */}
      <header className="p-8 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-mono">Back</span>
        </button>

        <h1 className="font-mono text-2xl font-bold text-center absolute left-1/2 -translate-x-1/2">
          Choose Your Vibe
        </h1>
      </header>

      {/* Main Content - Images */}
      <main className="flex-1 flex flex-col justify-center px-8 gap-4">
        {imageGroups[currentGroup].map((imageId, index) => (
          <motion.div
            key={imageId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleImageClick(index)}
            className="w-full aspect-[3/2] relative overflow-hidden rounded-lg cursor-pointer group"
          >
            <img
              src={`https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=800&h=800`}
              alt={`Choice ${index + 1}`}
              className="w-full h-full object-cover filter grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300" />
          </motion.div>
        ))}
      </main>

      {/* Progress Bar - Bottom */}
      <footer className="p-8">
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </footer>
    </motion.div>
  );
};

export default VibeMatching;
