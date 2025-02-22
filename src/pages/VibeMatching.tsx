
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface ImageGroup {
  id: string;
  images: string[];
}

interface VibeImageProps {
  imageId: string;
  index: number;
  onClick: () => void;
}

// Constants
const VIBE_GROUPS: Record<string, ImageGroup> = {
  initial: {
    id: 'initial',
    images: [
      'photo-1472396961693-142e6e269027',
      'photo-1509316975850-ff9c5deb0cd9',
      'photo-1482938289607-e9573fc25ebb'
    ]
  },
  group1: {
    id: 'group1',
    images: [
      'photo-1488590528505-98d2b5aba04b',
      'photo-1531297484001-80022131f5a1',
      'photo-1487058792275-0ad4aaf24ca7'
    ]
  },
  group2: {
    id: 'group2',
    images: [
      'photo-1486718448742-163732cd1544',
      'photo-1439337153520-7082a56a81f4',
      'photo-1497604401993-f2e922e5cb0a'
    ]
  },
  group3: {
    id: 'group3',
    images: [
      'photo-1482938289607-e9573fc25ebb',
      'photo-1509316975850-ff9c5deb0cd9',
      'photo-1472396961693-142e6e269027'
    ]
  }
};

// Reusable components
const VibeImage: React.FC<VibeImageProps> = ({ imageId, index, onClick }) => (
  <motion.div
    key={imageId}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className="w-full aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
  >
    <img
      src={`https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=800&h=800`}
      alt={`Choice ${index + 1}`}
      className="w-full h-full object-cover filter grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300" />
  </motion.div>
);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
    <div 
      className="h-full bg-white transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const [currentGroupId, setCurrentGroupId] = useState<string>('initial');
  const [step, setStep] = useState(1);
  const maxSteps = 3;

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const handleImageClick = () => {
    if (step < maxSteps) {
      const nextStep = step + 1;
      setStep(nextStep);
      setCurrentGroupId(`group${step}`);
    } else {
      navigate('/');
    }
  };

  const currentGroup = VIBE_GROUPS[currentGroupId];

  return (
    <motion.div 
      className="h-screen bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <header className="p-8 flex justify-between items-center relative">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-mono">Back</span>
        </button>

        <div className="absolute right-8 top-8">
          <h1 className="font-mono text-2xl font-bold bg-white text-black px-6 py-3 rounded-lg">
            Choose Your Vibe
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-8 gap-6">
        {currentGroup.images.map((imageId, index) => (
          <VibeImage
            key={imageId}
            imageId={imageId}
            index={index}
            onClick={() => handleImageClick()}
          />
        ))}
      </main>

      <footer className="p-8">
        <ProgressBar progress={(step / maxSteps) * 100} />
      </footer>
    </motion.div>
  );
};

export default VibeMatching;
