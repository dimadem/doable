
import React, { useCallback, useMemo } from 'react';
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
import VibeMedia from '../components/VibeMedia';
import { MAX_STEPS, MEDIA_PER_STEP } from '../constants';

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { personalities, loading, error: loadError } = usePersonalities();
  const { step, selections, isComplete, error, selectVibe, setError, reset } = useVibeState();

  // Group media URLs from personalities for exactly 3 steps with 3 items each
  const mediaGroups = useMemo(() => {
    if (!personalities?.length) return [];
    
    const allMedia = personalities.flatMap(p => 
      (p.url_array || []).map(url => ({ url, personalityName: p.name }))
    );

    // Shuffle media to randomize choices
    const shuffled = [...allMedia].sort(() => Math.random() - 0.5);
    
    // Take exactly 9 items (3 steps × 3 items per step)
    const selectedMedia = shuffled.slice(0, MAX_STEPS * MEDIA_PER_STEP);
    
    // Group into sets of 3 for each step
    return Array.from({ length: MAX_STEPS }, (_, i) => 
      selectedMedia.slice(i * MEDIA_PER_STEP, (i + 1) * MEDIA_PER_STEP)
    );
  }, [personalities]);

  const handleImageSelect = useCallback(async (imageUrl: string) => {
    try {
      const personality = personalities?.find(p => p.url_array?.includes(imageUrl));
      if (!personality) throw new Error('Could not match image to personality');

      selectVibe(personality.name);

      if (step + 1 >= MAX_STEPS) {
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
  if (!mediaGroups.length) return <ErrorState error="No media content available" onRetry={reset} />;

  const progress = (step / MAX_STEPS) * 100;
  const currentGroup = mediaGroups[step] || [];

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

      <main className="flex-1 flex flex-col gap-4 p-4 max-w-md mx-auto w-full">
        {currentGroup.map((media, index) => (
          <VibeMedia
            key={media.url}
            imageId={media.url}
            index={index}
            onClick={() => handleImageSelect(media.url)}
          />
        ))}
      </main>
    </motion.div>
  );
};

export default VibeMatching;
