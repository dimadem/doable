
export const pageVariants = {
  initial: { 
    opacity: 0, 
    x: 100 
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { 
      duration: 0.3 
    }
  }
};

export const pulseVariants = {
  idle: {
    scale: [1, 1.02, 1],
    opacity: [0.5, 0.7, 0.5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  active: {
    scale: [1, 1.05, 1],
    opacity: [0.6, 0.9, 0.6],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  transition: { duration: 0.2 }
};
