
import React from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestSession } from '../services/sessionService';
import { SessionResponse, PersonalityAnalysis } from '../types';
import { pageVariants } from '@/animations/pageTransitions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/PageHeader';

const formatTraits = (traits: Record<string, any> | null) => {
  if (!traits) return {};
  return Object.entries(traits).reduce((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, number>);
};

const formatPatterns = (patterns: Record<string, any> | null) => {
  if (!patterns) return {};
  return patterns;
};

const Struggle: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: sessionData } = useQuery<SessionResponse>({
    queryKey: ['latestSession'],
    queryFn: fetchLatestSession,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Error",
            description: "Failed to load session data",
            variant: "destructive",
          });
        }
      }
    }
  });

  if (!sessionData) {
    return (
      <motion.div
        className="min-h-[100svh] bg-black text-white flex flex-col"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <PageHeader 
          title="struggle" 
          onBack={() => navigate('/vibe-matching')}
        />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading session data...</p>
        </div>
      </motion.div>
    );
  }

  const personalityData = sessionData.personalities;
  const personality: PersonalityAnalysis | null = personalityData ? {
    type: personalityData.name,
    traits: formatTraits(personalityData.core_traits),
    patterns: formatPatterns(personalityData.behavior_patterns),
    selections: sessionData.session_data.selections
  } : null;

  return (
    <motion.div
      className="min-h-[100svh] bg-black text-white flex flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <PageHeader 
        title="struggle" 
        onBack={() => navigate('/vibe-matching')}
      />

      <main className="flex-1 p-4">
        <div className="space-y-6">
          {personality && (
            <>
              <section>
                <h2 className="text-xl font-mono mb-4">Personality Type: {personality.type}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(personality.traits).map(([trait, value]) => (
                    <div key={trait} className="border border-white/20 p-4 rounded-lg">
                      <h3 className="font-mono text-sm mb-2">{trait}</h3>
                      <div className="flex items-center space-x-2">
                        <Square className="w-4 h-4" />
                        <span>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-mono mb-4">Behavior Patterns</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(personality.patterns).map(([pattern, value]) => (
                    <div key={pattern} className="border border-white/20 p-4 rounded-lg">
                      <h3 className="font-mono text-sm mb-2">{pattern}</h3>
                      <p>{String(value)}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          <div className="flex justify-center mt-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/voice-double')}
            >
              Continue to Voice Double
            </Button>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Struggle;
