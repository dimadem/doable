
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
  id: string;
  name: string;
  url_array: string[];
};

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalities, setPersonalities] = useState<Personality[]>([]);

  useEffect(() => {
    const fetchPersonalities = async () => {
      setLoading(true);
      console.log('Fetching personalities...');
      
      const { data, error } = await supabase
        .from('personalities')
        .select('id, name, url_array');

      console.log('Raw data from Supabase:', data);
      console.log('Supabase error:', error);

      if (error) {
        console.error('Error fetching personalities:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No data received from Supabase');
        setError('No personality data available');
        setLoading(false);
        return;
      }

      // Transform the data
      try {
        console.log('Attempting to process data...');
        const processedData = data.map(personality => {
          console.log('Processing personality:', personality);
          try {
            let parsedArray: string[] = [];
            if (typeof personality.url_array === 'string') {
              parsedArray = JSON.parse(personality.url_array);
            } else if (Array.isArray(personality.url_array)) {
              parsedArray = personality.url_array;
            }
            console.log('Parsed url_array:', parsedArray);
            return {
              ...personality,
              url_array: parsedArray
            };
          } catch (parseError) {
            console.error('Error parsing url_array for personality:', personality.name, parseError);
            return {
              ...personality,
              url_array: []
            };
          }
        });

        console.log('Processed data:', processedData);
        setPersonalities(processedData);
      } catch (processError) {
        console.error('Error processing data:', processError);
        setError('Error processing personality data');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalities();
  }, []);

  const getCurrentImages = () => {
    if (!personalities.length) return [];
    
    console.log('Current step:', step);
    console.log('Available personalities:', personalities);
    
    // Get one image from each personality for the current step
    const images = personalities.map(personality => {
      const currentImage = personality.url_array[step - 1];
      console.log(`Getting image for ${personality.name}, step ${step}:`, currentImage);
      return {
        name: personality.name,
        imageId: currentImage || ''
      };
    }).filter(item => item.imageId);
    
    console.log('Current images:', images);
    return images;
  };

  const handleImageClick = (selectedPersonality: string) => {
    console.log('Selected personality:', selectedPersonality);
    
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
