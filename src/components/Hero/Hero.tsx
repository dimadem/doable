
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Progress Indicator */}
      <div className="fixed top-8 right-8 flex gap-2">
        {[1, 2, 3].map((step, i) => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-black' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <span className="font-mono text-sm tracking-wider text-gray-600 mb-4 block">
          DISCOVER YOURSELF
        </span>
        <h1 className="font-mono text-4xl md:text-5xl font-bold mb-6">
          doible
        </h1>
        <p className="font-mono text-lg text-gray-600 max-w-md mx-auto">
          Uncover your authentic personality archetype through our innovative discovery process.
        </p>
      </motion.div>

      {/* Personality Archetypes */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-4xl">
        {[
          { title: "The Analyst", desc: "Logical & Strategic" },
          { title: "The Innovator", desc: "Creative & Forward-thinking" },
          { title: "The Diplomat", desc: "Empathetic & Harmonious" }
        ].map((archetype, i) => (
          <div 
            key={i}
            className="group relative overflow-hidden bg-gray-50 aspect-square rounded-lg animate-float"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <div className="text-center p-4">
                <h3 className="font-mono text-lg font-bold mb-2">{archetype.title}</h3>
                <p className="font-mono text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {archetype.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        variants={itemVariants}
        className="font-mono px-8 py-4 bg-black text-white rounded-lg 
                   transform transition duration-300 hover:scale-105
                   border-2 border-transparent animate-pulse-border"
      >
        Start Personality Discovery
      </motion.button>

      {/* Scroll Indicator */}
      <motion.div 
        variants={itemVariants}
        className="absolute bottom-8 animate-bounce"
      >
        <ChevronDown className="text-gray-400" />
      </motion.div>
    </motion.div>
  );
};

export default Hero;
