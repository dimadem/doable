
import { motion } from 'framer-motion';
import { pageVariants } from '../../animations/pageTransitions';

export const LoadingState = () => (
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
