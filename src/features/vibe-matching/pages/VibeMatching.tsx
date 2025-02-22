
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layouts/PageHeader';
import { pageVariants } from '@/animations/pageTransitions';
import { VibeImage } from '../components/VibeImage';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { usePersonalities } from '../hooks/usePersonalities';
import { determinePersonality, saveUserSession } from '../services/personalityService';
import { MAX_STEPS } from '../constants';
import { SessionSelection } from '../types';

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<SessionSelection[]>([]);
  const { personalities, loading, error } = usePersonalities();

  const getCurrentImages = () => {
    if (!personalities.length) return [];
    
    // Get an image from each of the first 3 personalities for the current step
    return personalities
      .slice(0, 3) // Take first 3 personalities
      .map(personality => ({
        name: personality.name,
        imageId: personality.url_array[step - 1] || ''
      }))
      .filter(item => item.imageId); // Only show items that have an image
  };

  const handleImageClick = async (selectedPersonality: string) => {
    const newSelection = {
      step,
      personalityName: selectedPersonality
    };
    
    const updatedSelections = [...selections, newSelection];
    setSelections(updatedSelections);

    if (step < MAX_STEPS) {
      setStep(step + 1);
    } else {
      const finalPersonality = determinePersonality(updatedSelections);
      const success = await saveUserSession(finalPersonality, updatedSelections, personalities);
      if (success) {
        navigate('/struggle', { replace: true });
      }
    }
  };

  if (loading) return <LoadingState />;
  if (error || personalities.length === 0) return <ErrorState error={error} onRetry={() => window.location.reload()} />;

  const currentImages = getCurrentImages();

  // Ensure we have exactly 3 images before proceeding
  if (currentImages.length !== 3) {
    return <ErrorState error="Not enough personality images available" onRetry={() => window.location.reload()} />;
  }

  return (
    <motion.div 
      className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <PageHeader 
        title="check the vibe"
        onBack={() => navigate('/')}
      />

      <main className="flex-1 flex flex-col justify-evenly px-4 py-2 gap-3 overflow-y-auto">
        {currentImages.map(({ imageId, name }, index) => (
          <VibeImage
            key={`${name}-${imageId}`}
            imageId={imageId}
            index={index}
            onClick={() => handleImageClick(name)}
          />
        ))}
      </main>

      <footer className="p-4 shrink-0">
        <ProgressBar progress={(step / MAX_STEPS) * 100} />
      </footer>
    </motion.div>
  );
};

export default VibeMatching;
