
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { ErrorStateProps } from '../../types';

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
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
      onClick={onRetry}
      className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
    >
      Retry
    </button>
  </motion.div>
);

export default ErrorState;
