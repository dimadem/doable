
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layouts/PageHeader';
import { pageVariants } from '../animations/pageTransitions';
import { supabase } from '../integrations/supabase/client';

type SessionSelection = {
  step: number;
  personalityName: string;
};

type SessionData = {
  selections: SessionSelection[];
  finalPersonality: string;
};

type PersonalityData = {
  name: string;
  core_traits: Record<string, any> | null;
  behavior_patterns: Record<string, any> | null;
};

type SessionResponse = {
  session_data: SessionData;
  personalities: PersonalityData | null;
};

const Struggle: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestSession = async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select(`
          session_data,
          personality_id,
          personalities (
            name,
            core_traits,
            behavior_patterns
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        return;
      }

      if (sessionData) {
        const typedSessionData = sessionData as unknown as SessionResponse;
        console.log('Personality Analysis:', {
          type: typedSessionData.personalities?.name,
          traits: typedSessionData.personalities?.core_traits,
          patterns: typedSessionData.personalities?.behavior_patterns,
          selections: typedSessionData.session_data.selections
        });
      }
    };

    fetchLatestSession();
  }, []);

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
