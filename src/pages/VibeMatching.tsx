
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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

type Selection = {
  step: number;
  personalityName: string;
};

const VibeMatching: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);

  useEffect(() => {
    const fetchPersonalities = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('personalities')
        .select('id, name, url_array');

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError('No personality data available');
        setLoading(false);
        return;
      }

      try {
        const processedData = data.map(personality => {
          try {
            let parsedArray: string[] = [];
            if (typeof personality.url_array === 'string') {
              parsedArray = JSON.parse(personality.url_array);
            } else if (Array.isArray(personality.url_array)) {
              parsedArray = personality.url_array;
            }
            return {
              ...personality,
              url_array: parsedArray
            };
          } catch (parseError) {
            return {
              ...personality,
              url_array: []
            };
          }
        });

        setPersonalities(processedData);
      } catch (processError) {
        setError('Error processing personality data');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalities();
  }, []);

  const getCurrentImages = () => {
    if (!personalities.length) return [];
    
    return personalities
      .map(personality => ({
        name: personality.name,
        imageId: personality.url_array[step - 1] || ''
      }))
      .filter(item => item.imageId);
  };

  const determinePersonality = (selections: Selection[]): string => {
    // Count occurrences of each personality
    const counts = selections.reduce((acc, selection) => {
      acc[selection.personalityName] = (acc[selection.personalityName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find the personality with the most selections
    let maxCount = 0;
    let dominantPersonality = '';
    
    Object.entries(counts).forEach(([personality, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantPersonality = personality;
      }
    });

    return dominantPersonality;
  };

  const saveUserSession = async (personalityName: string) => {
    try {
      // Find the corresponding personality ID
      const personality = personalities.find(p => p.name === personalityName);
      
      if (!personality) {
        toast.error('Could not determine personality type');
        return;
      }

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert([
          {
            session_data: {
              selections,
              finalPersonality: personalityName
            },
            personality_id: personality.id
          }
        ]);

      if (sessionError) {
        toast.error('Failed to save session data');
        return;
      }

      toast.success(`Your personality type: ${personalityName}`);
    } catch (error) {
      toast.error('An error occurred while saving the session');
    }
  };

  const handleImageClick = async (selectedPersonality: string) => {
    // Record the selection
    const newSelection = {
      step,
      personalityName: selectedPersonality
    };
    
    const updatedSelections = [...selections, newSelection];
    setSelections(updatedSelections);

    if (step < MAX_STEPS) {
      setStep(step + 1);
    } else {
      // Determine final personality based on all selections
      const finalPersonality = determinePersonality(updatedSelections);
      await saveUserSession(finalPersonality);
      navigate('/struggle', { replace: true });
    }
  };

  if (loading) return (
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

  if (error || personalities.length === 0) return (
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
