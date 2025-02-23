
import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '@/components/layouts/AppHeader';
import { StruggleModeButtons } from '../components/StruggleModeButtons';
import { useStruggleMode } from '../hooks/useStruggleMode';
import { getPersonalityType, isStoredPersonalityData, isPersonalityInfo } from '../utils/personalityUtils';

const Struggle: React.FC = () => {
  const { sessionData, sessionResponse, handleStruggleTypeSelect } = useStruggleMode();

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
  const personalityType = personalityInfo ? getPersonalityType(personalityInfo) : '';

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
        {personalityType && (
          <div className="text-center mb-12">
            <h2 className="text-lg font-mono mb-2 text-gray-400">personality type</h2>
            <div className="text-3xl font-mono bg-white text-black px-6 py-3">
              {personalityType}
            </div>
          </div>
        )}

        <StruggleModeButtons onSelect={handleStruggleTypeSelect} />
      </main>
    </motion.div>
  );
};

export default Struggle;
