
import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layouts/AppHeader';
import { pageVariants } from '@/animations/pageTransitions';
import { useToast } from '@/hooks/use-toast';
import { determinePersonality, saveUserSession } from '../services/personalityService';
import { usePersonalities } from '../hooks/usePersonalities';
import { useVibeState } from '../hooks/useVibeState';
import { useSession } from '@/contexts/SessionContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ProgressBar from '../components/ProgressBar';
import VibeMedia from '../components/VibeMedia';
import { MAX_STEPS, MEDIA_PER_STEP } from '../constants';

const ALLOWED_PERSONALITIES = ['emotive', 'hyperthymic', 'persistent_paranoid'];

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPersonalityData } = useSession();
  const { personalities, loading, error: loadError } = usePersonalities();
  const { step, selections, error, selectVibe, setError, reset } = useVibeState();

  const mediaGroups = useMemo(() => {
    if (!personalities?.length) return [];
    
    const filteredPersonalities = personalities.filter(p => 
      ALLOWED_PERSONALITIES.includes(p.name)
    );

    if (filteredPersonalities.length !== ALLOWED_PERSONALITIES.length) {
      console.error('Missing some required personalities');
      return [];
    }

    const usedUrls = new Set<string>();

    return Array.from({ length: MAX_STEPS }, (_, stepIndex) => {
      const stepGroup = filteredPersonalities.map(personality => {
        const availableMedia = (personality.url_array || []).filter(url => 
          !usedUrls.has(url)
        );

        if (!availableMedia.length) {
          console.error(`No available media for personality ${personality.name}`);
          return null;
        }

        const randomIndex = Math.floor(Math.random() * availableMedia.length);
        const selectedUrl = availableMedia[randomIndex];
        
        usedUrls.add(selectedUrl);

        return {
          url: selectedUrl,
          personalityName: personality.name
        };
      }).filter(Boolean);

      return stepGroup.sort(() => Math.random() - 0.5);
    });
  }, [personalities]);

  const handleImageSelect = useCallback(async (imageUrl: string) => {
    try {
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
        const updatedSelections = [...selections, { 
          step, 
          personalityName: selectedPersonality.name 
        }];
        
        const dominantPersonality = determinePersonality(updatedSelections);
        
        await saveUserSession(
          dominantPersonality, 
          updatedSelections,
          personalities,
          setPersonalityData // Pass the setPersonalityData function
        );
        
        navigate('/struggle', { state: { direction: 1 } });
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
  }, [personalities, step, selections, selectVibe, setError, toast, navigate, setPersonalityData]);

  if (loading) return <LoadingState />;
  if (loadError || error) return <ErrorState error={error || loadError} onRetry={reset} />;
  if (!personalities?.length) return <ErrorState error="No personality data available" onRetry={reset} />;
  if (!mediaGroups.length) return <ErrorState error="No media content available" onRetry={reset} />;

  const progress = (step / MAX_STEPS) * 100;
  const currentGroup = mediaGroups[step] || [];

  return (
    <motion.div 
      className="h-[100svh] bg-black text-white flex flex-col overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      custom={1}
    >
      <AppHeader title="vibe matching" />
      
      <ProgressBar progress={progress} />

      <main className="flex-1 flex flex-col gap-2 p-2 max-w-md mx-auto w-full overflow-y-auto">
        <div className="grid grid-cols-1 gap-2 auto-rows-fr h-full">
          {currentGroup.map((media, index) => (
            <VibeMedia
              key={`${media.url}-${index}`}
              imageId={media.url}
              index={index}
              onClick={() => handleImageSelect(media.url)}
            />
          ))}
        </div>
      </main>
    </motion.div>
  );
};

export default VibeMatching;
