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

const ALLOWED_PERSONALITIES = ['emotive', 'hyperthymic', 'persistent_paranoid'];

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { personalities, loading, error: loadError } = usePersonalities();
  const { step, selections, error, selectVibe, setError, reset } = useVibeState();

  // Filter and prepare media groups from allowed personalities only
  const mediaGroups = useMemo(() => {
    if (!personalities?.length) return [];
    
    // Filter to only include our three specific personalities
    const filteredPersonalities = personalities.filter(p => 
      ALLOWED_PERSONALITIES.includes(p.name)
    );

    if (filteredPersonalities.length !== ALLOWED_PERSONALITIES.length) {
      console.error('Missing some required personalities');
      return [];
    }

    // Keep track of used URLs to avoid repetition
    const usedUrls = new Set<string>();

    // Create media groups for each step
    return Array.from({ length: MAX_STEPS }, (_, stepIndex) => {
      const stepGroup = filteredPersonalities.map(personality => {
        // Get available media for this personality that hasn't been used yet
        const availableMedia = (personality.url_array || []).filter(url => 
          !usedUrls.has(url)
        );

        if (!availableMedia.length) {
          console.error(`No available media for personality ${personality.name}`);
          return null;
        }

        // Randomly select one media item from available options
        const randomIndex = Math.floor(Math.random() * availableMedia.length);
        const selectedUrl = availableMedia[randomIndex];
        
        // Mark this URL as used
        usedUrls.add(selectedUrl);

        return {
          url: selectedUrl,
          personalityName: personality.name
        };
      }).filter(Boolean); // Remove any null entries

      // Shuffle the media items within this step
      return stepGroup.sort(() => Math.random() - 0.5);
    });
  }, [personalities]);

  const handleImageSelect = useCallback(async (imageUrl: string) => {
    try {
      // Find which personality this media belongs to
      const selectedPersonality = personalities?.find(p => 
        p.url_array?.includes(imageUrl)
      );

      if (!selectedPersonality) {
        throw new Error('Could not match image to personality');
      }

      if (!ALLOWED_PERSONALITIES.includes(selectedPersonality.name)) {
        throw new Error('Invalid personality type selected');
      }

      selectVibe(selectedPersonality.name);

      if (step + 1 >= MAX_STEPS) {
        const dominantPersonality = determinePersonality([...selections, { 
          step, 
          personalityName: selectedPersonality.name 
        }]);
        
        await saveUserSession(
          dominantPersonality, 
          [...selections, { step, personalityName: selectedPersonality.name }],
          personalities
        );
        
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
            key={`${media.url}-${index}`}
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
