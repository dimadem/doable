
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { pageVariants } from "@/animations/pageTransitions";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const direction = (location.state as { direction?: number })?.direction || 1;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <motion.div 
      className="min-h-[100svh] flex items-center justify-center bg-black text-white"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      custom={direction}
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-mono font-bold">404</h1>
        <p className="text-xl font-mono text-white/60">Oops! Page not found</p>
        <button 
          onClick={() => navigate('/', { state: { direction: -1 } })}
          className="text-white/80 hover:text-white underline font-mono"
        >
          Return to Home
        </button>
      </div>
    </motion.div>
  );
};

export default NotFound;
