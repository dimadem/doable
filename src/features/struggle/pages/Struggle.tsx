
import React from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layouts/PageHeader';
import { pageVariants } from '@/animations/pageTransitions';
import { useToast } from '@/hooks/use-toast';
import { fetchLatestSession, updateSessionStartTime } from '../services/sessionService';
import { CoreTraits, BehaviorPatterns } from '@/features/vibe-matching/types';

const Struggle: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: sessionData } = useQuery({
    queryKey: ['latestSession'],
    queryFn: fetchLatestSession,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load session data",
          variant: "destructive",
        });
      }
    }
  });

  // Log personality data with proper type annotations
  if (sessionData?.personalities) {
    const personalityAnalysis = {
      type: sessionData.personalities.name,
      traits: formatTraits(sessionData.personalities.core_traits),
      patterns: formatPatterns(sessionData.personalities.behavior_patterns),
      selections: sessionData.session_data.selections
    };
    console.log('Personality Analysis:', personalityAnalysis);
  }

  const handleHardTaskClick = async () => {
    try {
      if (!sessionData) {
        throw new Error('No active session found');
      }
      
      await updateSessionStartTime(sessionData.id);
      navigate('/voice-double');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
      console.error('Failed to update session start time:', error);
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
        title="struggle"
        onBack={() => navigate('/vibe-matching')}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <motion.button
          onClick={handleHardTaskClick}
          className="relative flex flex-col items-center justify-center w-64 h-64"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="absolute inset-0 border-2 border-white/20 rounded-lg"
            animate={{
              scale: [1, 1.05, 1],
              borderWidth: ["2px", "1px", "2px"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Square className="w-16 h-16 mb-4" />
          <span className="font-mono text-xl">Hard Task</span>
        </motion.button>
      </main>
    </motion.div>
  );
};

// Helper functions to format personality data
const formatTraits = (traits: CoreTraits | null): Partial<Record<keyof CoreTraits, number>> => {
  if (!traits) return {};
  
  return Object.entries(traits).reduce((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc[key as keyof CoreTraits] = value;
    }
    return acc;
  }, {} as Partial<Record<keyof CoreTraits, number>>);
};

const formatPatterns = (patterns: BehaviorPatterns | null): Partial<BehaviorPatterns> => {
  if (!patterns) return {};
  
  return Object.entries(patterns).reduce((acc, [key, value]) => {
    if (value && key in patterns) {
      acc[key as keyof BehaviorPatterns] = value;
    }
    return acc;
  }, {} as Partial<BehaviorPatterns>);
};

export default Struggle;
