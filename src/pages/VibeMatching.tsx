
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layouts/PageHeader';
import { VibeImage } from '../components/vibe/VibeImage';
import { ProgressBar } from '../components/vibe/ProgressBar';
import { pageVariants } from '../animations/pageTransitions';
import { supabase } from '../integrations/supabase/client';
import { MAX_STEPS } from '../constants/vibeGroups';

type Personality = {
  name: string;
  url_array: string[];
};

const PERSONALITY_TYPES = ['hyperthymic', 'emotive', 'persistent_paranoid'];

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalities, setPersonalities] = useState<Personality[]>([]);

  useEffect(() => {
    const fetchPersonality = async (name: string) => {
      const { data, error: supabaseError } = await supabase
        .from('personalities')
        .select('name, url_array')
        .eq('name', name)
        .maybeSingle();

      if (supabaseError) throw supabaseError;
      if (!data) {
        throw new Error(`Personality type "${name}" not found in database`);
      }

      return {
        ...data,
        url_array: data.url_array ? JSON.parse(data.url_array) : []
      };
    };

    const fetchAllPersonalities = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.allSettled(
          PERSONALITY_TYPES.map(type => fetchPersonality(type))
        );

        const successfulResults: Personality[] = [];
        const failedTypes: string[] = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successfulResults.push(result.value);
          } else {
            failedTypes.push(PERSONALITY_TYPES[index]);
            console.error(`Failed to fetch ${PERSONALITY_TYPES[index]}:`, result.reason);
          }
        });

        if (failedTypes.length > 0) {
          throw new Error(
            `Failed to load some personality types: ${failedTypes.join(', ')}. ` +
            `Successfully loaded: ${successfulResults.map(p => p.name).join(', ')}`
          );
        }

        setPersonalities(successfulResults);
      } catch (err) {
        console.error('Error fetching personalities:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading personalities');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPersonalities();
  }, []);

  const getCurrentImages = () => {
    return personalities.map(personality => ({
      name: personality.name,
      imageId: Array.isArray(personality.url_array) ? personality.url_array[step - 1] || '' : ''
    })).filter(item => item.imageId);
  };

  const handleImageClick = () => {
    if (step < MAX_STEPS) {
      setStep(step + 1);
    } else {
      navigate('/struggle', { replace: true });
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-[100svh] bg-black text-white flex flex-col items-center justify-center"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="animate-pulse">Loading...</div>
      </motion.div>
    );
  }

  if (error || personalities.length === 0) {
    return (
      <motion.div 
        className="min-h-[100svh] bg-black text-white flex flex-col items-center justify-center"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="text-red-500 max-w-md text-center px-4">
          <p className="text-lg font-bold mb-2">Error Loading Personalities</p>
          <p>{error || 'No personality data available'}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  const currentImages = getCurrentImages();

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
