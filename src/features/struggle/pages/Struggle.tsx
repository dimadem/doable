
import React from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layouts/PageHeader';
import { pageVariants } from '@/animations/pageTransitions';
import { useToast } from '@/hooks/use-toast';
import { fetchLatestSession } from '../services/sessionService';

const Struggle: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: sessionData } = useQuery({
    queryKey: ['latestSession'],
    queryFn: fetchLatestSession,
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    }
  });

  // Log personality data when available
  if (sessionData?.personalities) {
    console.log('Personality Analysis:', {
      type: sessionData.personalities.name,
      traits: sessionData.personalities.core_traits,
      patterns: sessionData.personalities.behavior_patterns,
      selections: sessionData.session_data.selections
    });
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
        title="struggle"
        onBack={() => navigate('/vibe-matching')}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <motion.button
          onClick={() => navigate('/voice-double')}
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

export default Struggle;
