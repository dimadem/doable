
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layouts/PageHeader';
import { VibeImage } from '../components/vibe/VibeImage';
import { ProgressBar } from '../components/vibe/ProgressBar';
import { VIBE_GROUPS, MAX_STEPS } from '../constants/vibeGroups';
import { pageVariants } from '../animations/pageTransitions';

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const [currentGroupId, setCurrentGroupId] = useState<string>('initial');
  const [step, setStep] = useState(1);

  const handleImageClick = () => {
    if (step < MAX_STEPS) {
      setStep(step + 1);
      setCurrentGroupId(`group${step}`);
    } else {
      navigate('/struggle', { replace: true });
    }
  };

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
        {VIBE_GROUPS[currentGroupId].images.map((imageId, index) => (
          <VibeImage
            key={imageId}
            imageId={imageId}
            index={index}
            onClick={handleImageClick}
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
