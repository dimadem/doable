
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layouts/PageHeader';
import { pageVariants } from '@/animations/pageTransitions';
import { useToast } from '@/hooks/use-toast';
import { determinePersonality, saveUserSession } from '../services/personalityService';
import { usePersonalities } from '../hooks/usePersonalities';
import { useVibeState } from '../hooks/useVibeState';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ProgressBar from '../components/ProgressBar';
import VibeImage from '../components/VibeImage';
import { VIBE_GROUPS } from '../constants';

const TOTAL_STEPS = Object.keys(VIBE_GROUPS).length - 1; // Subtract 1 for 'initial'

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { personalities, loading, error: loadError } = usePersonalities();
  const { step, selections, isComplete, error, selectVibe, setError, reset } = useVibeState();

  const handleImageSelect = useCallback(async (imageUrl: string) => {
    try {
      const personality = personalities?.find(p => p.url_array?.includes(imageUrl));
      if (!personality) throw new Error('Could not match image to personality');

      selectVibe(personality.name);

      if (step + 1 >= TOTAL_STEPS) {
        const dominantPersonality = determinePersonality(selections);
        await saveUserSession(dominantPersonality, selections, personalities);
        toast({
          title: "Success",
          description: `Your personality type: ${dominantPersonality}`
        });
        navigate('/struggle');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process selection';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    }
  }, [personalities, step, selections, selectVibe, setError, toast, navigate]);

  if (loading) return <LoadingState />;
  if (loadError || error) return <ErrorState error={error || loadError} onRetry={reset} />;
  if (!personalities?.length) return <ErrorState error="No personality data available" onRetry={reset} />;

  const progress = (step / TOTAL_STEPS) * 100;
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
        {currentGroup.images.map((imageUrl, index) => (
          <VibeImage
            key={imageUrl}
            imageId={imageUrl}
            index={index}
            onClick={() => handleImageSelect(imageUrl)}
          />
        ))}
      </main>
    </motion.div>
  );
};

export default VibeMatching;
