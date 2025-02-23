
import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Target, Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestSession, updateSessionStruggleType, type StruggleType } from '../services/sessionService';
import { SessionResponse, PersonalityAnalysis } from '../types';
import { pageVariants } from '@/animations/pageTransitions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/layouts/AppHeader';
import { getSessionData } from '@/features/session/utils/sessionStorage';
import { sessionLogger } from '@/utils/sessionLogger';
import { StoredPersonalityData } from '@/features/session/types/session.types';
import { CoreTraits, BehaviorPatterns } from '@/features/vibe-matching/types';

interface PersonalityInfo {
  name: string;
  core_traits: CoreTraits;
  behavior_patterns: BehaviorPatterns;
}

const formatTraits = (traits: Record<string, any> | null) => {
  if (!traits) return {};
  return Object.entries(traits).reduce((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, number>);
};

const isStoredPersonalityData = (data: any): data is StoredPersonalityData => {
  return data && typeof data === 'object' && 'personalityKey' in data && 'selections' in data;
};

const isPersonalityInfo = (data: any): data is PersonalityInfo => {
  return data && typeof data === 'object' && 'name' in data && 'core_traits' in data;
};

const Struggle: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionData = getSessionData();

  const { data: sessionResponse } = useQuery<SessionResponse>({
    queryKey: ['latestSession'],
    queryFn: fetchLatestSession,
    enabled: !sessionData?.personalityData,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          sessionLogger.error('Failed to load session data', error);
          toast({
            title: "Error",
            description: "Failed to load session data",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    }
  });

  const handleStruggleTypeSelect = async (struggleType: StruggleType) => {
    if (!sessionData?.sessionId) {
      sessionLogger.error('No active session found');
      toast({
        title: "Error",
        description: "No active session found",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    const personalityData = sessionData.personalityData || sessionResponse?.personalities?.name;

    if (!personalityData) {
      sessionLogger.error('No personality type found');
      toast({
        title: "Error",
        description: "No personality type found",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    try {
      const personality: PersonalityAnalysis = {
        type: isStoredPersonalityData(personalityData) 
          ? personalityData.finalPersonality 
          : typeof personalityData === 'string' 
            ? personalityData 
            : personalityData.name,
        traits: formatTraits(
          isStoredPersonalityData(personalityData) && personalityData.core_traits
            ? personalityData.core_traits 
            : isPersonalityInfo(personalityData)
              ? personalityData.core_traits
              : null
        ),
        patterns: {},
        selections: isStoredPersonalityData(personalityData) 
          ? personalityData.selections 
          : sessionResponse?.session_data?.selections || []
      };

      const personalityKey = isStoredPersonalityData(personalityData)
        ? personalityData.finalPersonality
        : typeof personalityData === 'string'
          ? personalityData
          : personalityData.name;

      await updateSessionStruggleType(
        sessionData.sessionId,
        struggleType,
        personalityKey,
        personality
      );
      
      sessionLogger.info('Struggle type updated successfully', {
        struggleType,
        sessionId: sessionData.sessionId
      });

      toast({
        title: "Success",
        description: `${struggleType.replace('_', ' ')} mode activated`,
      });
      
      navigate('/voice-double');
    } catch (error) {
      sessionLogger.error('Failed to update struggle type', error);
      toast({
        title: "Error",
        description: "Failed to update struggle type",
        variant: "destructive",
      });
    }
  };

  if (!sessionData?.personalityData && !sessionResponse) {
    return (
      <motion.div
        className="min-h-[100svh] bg-black text-white flex flex-col"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <AppHeader title="struggle" />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono">Loading session data...</p>
        </div>
      </motion.div>
    );
  }

  const personalityInfo = sessionData?.personalityData || sessionResponse?.personalities;
  const personality: PersonalityAnalysis | null = personalityInfo ? {
    type: isStoredPersonalityData(personalityInfo) 
      ? personalityInfo.finalPersonality 
      : isPersonalityInfo(personalityInfo)
        ? personalityInfo.name
        : typeof personalityInfo === 'string'
          ? personalityInfo
          : '',
    traits: formatTraits(
      isStoredPersonalityData(personalityInfo) && personalityInfo.core_traits
        ? personalityInfo.core_traits
        : isPersonalityInfo(personalityInfo)
          ? personalityInfo.core_traits
          : null
    ),
    patterns: {},
    selections: isStoredPersonalityData(personalityInfo)
      ? personalityInfo.selections
      : sessionResponse?.session_data?.selections || []
  } : null;

  return (
    <motion.div
      className="min-h-[100svh] bg-black text-white flex flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <AppHeader title="struggle" />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {personality && (
          <div className="text-center mb-12">
            <h2 className="text-lg font-mono mb-2 text-gray-400">personality type</h2>
            <div className="text-3xl font-mono bg-white text-black px-6 py-3">
              {personality.type}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 max-w-3xl w-full px-4">
          <Button
            variant="outline"
            onClick={() => handleStruggleTypeSelect('pomodoro')}
            className="flex flex-col items-center gap-4 p-6 h-auto aspect-square border-white/20 hover:bg-white hover:text-black transition-colors"
          >
            <Timer className="w-8 h-8" />
            <span className="font-mono">pomodoro</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleStruggleTypeSelect('hard_task')}
            className="flex flex-col items-center gap-4 p-6 h-auto aspect-square border-white/20 hover:bg-white hover:text-black transition-colors"
          >
            <Target className="w-8 h-8" />
            <span className="font-mono">hard task</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleStruggleTypeSelect('deep_focus')}
            className="flex flex-col items-center gap-4 p-6 h-auto aspect-square border-white/20 hover:bg-white hover:text-black transition-colors"
          >
            <Focus className="w-8 h-8" />
            <span className="font-mono">deep focus</span>
          </Button>
        </div>
      </main>
    </motion.div>
  );
};

export default Struggle;
