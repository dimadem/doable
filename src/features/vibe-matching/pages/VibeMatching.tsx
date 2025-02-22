
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layouts/PageHeader';
import { pageVariants } from '@/animations/pageTransitions';
import { useToast } from '@/hooks/use-toast';
import { determinePersonality, saveUserSession } from '../services/personalityService';
import { usePersonalities } from '../hooks/usePersonalities';
import { SessionSelection } from '../types';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ProgressBar from '../components/ProgressBar';
import VibeImage from '../components/VibeImage';
import { VIBE_GROUPS } from '../constants';

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<SessionSelection[]>([]);
  const { personalities, loading, error } = usePersonalities();

  const progress = Math.min((step / Object.keys(VIBE_GROUPS).length) * 100, 100);

  const handleImageSelect = async (personalityName: string) => {
    const newSelection: SessionSelection = {
      step,
      personalityName
    };

    const updatedSelections = [...selections, newSelection];
    setSelections(updatedSelections);

    if (step < Object.keys(VIBE_GROUPS).length - 1) {
      setStep(step + 1);
    } else {
      try {
        if (!personalities) throw new Error('No personalities data available');
        
        const dominantPersonality = determinePersonality(updatedSelections);
        await saveUserSession(dominantPersonality, updatedSelections, personalities);
        
        toast({
          title: "Success",
          description: `Your personality type: ${dominantPersonality}`
        });
        
        navigate('/struggle');
      } catch (error) {
        console.error('Error saving session:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to save session',
          variant: "destructive"
        });
      }
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!personalities) return <ErrorState error="No personality data available" onRetry={() => window.location.reload()} />;

  const currentGroup = VIBE_GROUPS[`group${step}`] || VIBE_GROUPS.initial;

  return (
    <motion.div 
      className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <PageHeader 
        title="vibe matching"
        onBack={() => navigate('/')}
      />
      
      <ProgressBar progress={progress} />

      <main className="flex-1 grid grid-cols-2 gap-4 p-4">
        {currentGroup.images.map((imageId, index) => (
          <VibeImage
            key={imageId}
            imageId={imageId}
            index={index}
            onClick={() => {
              const personality = personalities.find(p => p.url_array?.includes(imageId));
              if (personality) {
                handleImageSelect(personality.name);
              }
            }}
          />
        ))}
      </main>
    </motion.div>
  );
};

export default VibeMatching;
