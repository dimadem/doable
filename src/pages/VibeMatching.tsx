
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

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPersonality, setCurrentPersonality] = useState<Personality | null>(null);

  useEffect(() => {
    const fetchPersonality = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let personalityName = 'hyperthymic';
        if (step === 2) personalityName = 'emotive';
        if (step === 3) personalityName = 'persistent_paranoid'; // Fixed typo here

        const { data, error: supabaseError } = await supabase
          .from('personalities')
          .select('name, url_array')
          .eq('name', personalityName)
          .maybeSingle(); // Changed from single() to maybeSingle() to handle no results more gracefully

        if (supabaseError) throw supabaseError;
        if (!data) throw new Error(`No personality data found for ${personalityName}`);

        setCurrentPersonality(data);
      } catch (err) {
        console.error('Error fetching personality:', err);
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonality();
  }, [step]);

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

  if (error || !currentPersonality) {
    return (
      <motion.div 
        className="min-h-[100svh] bg-black text-white flex flex-col items-center justify-center"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="text-red-500">{error || 'Failed to load images'}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
        >
          Retry
        </button>
      </motion.div>
    );
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
        {currentPersonality.url_array.map((imageId, index) => (
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
