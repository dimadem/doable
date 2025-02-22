
import React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorStateProps } from '../../types';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <motion.div
      className="min-h-[100svh] bg-black text-white flex flex-col items-center justify-center"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="text-red-500 max-w-md text-center px-4">
        <p className="text-lg font-bold mb-2 font-mono">Error Loading Personalities</p>
        <p className="font-mono">{error || 'No personality data available'}</p>
      </div>
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="mt-4 font-mono"
        >
          Try again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;
