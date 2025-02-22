
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

const Hero = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/vibe-matching');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      
      if (isRegistering) {
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/vibe-matching'
          }
        });
      } else {
        response = await supabase.auth.signInWithPassword({
          email,
          password
        });
      }

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: response.error.message
        });
      } else {
        if (isRegistering) {
          toast({
            title: "Check your email",
            description: "We've sent you a verification link."
          });
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
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
      className="min-h-[100svh] flex flex-col items-center justify-center px-4 bg-black text-white" 
      initial="hidden" 
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {/* Progress Indicator */}
      <div className="fixed top-8 right-8 flex gap-2">
        {[1, 2, 3].map((step, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-800'}`} 
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div 
        variants={itemVariants} 
        className="text-center mb-12"
      >
        <span className="font-mono text-sm tracking-wider text-gray-400 mb-4 block">
          just do it
        </span>
        <h1 className="font-mono font-bold mb-6 md:text-9xl text-7xl text-white">
          doable
        </h1>
        <p className="font-mono text-lg text-gray-400 max-w-md mx-auto">
          Uncover your authentic personality archetype through our innovative discovery process.
        </p>
      </motion.div>

      {/* Auth Form */}
      <motion.form 
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4"
      >
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-mono bg-transparent border-2 border-white text-white placeholder:text-gray-400"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-mono bg-transparent border-2 border-white text-white placeholder:text-gray-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full font-mono px-8 py-4 bg-black text-white border-2 border-white 
                   font-bold text-lg transition-all duration-300 hover:bg-white hover:text-black"
        >
          {isRegistering ? 'Sign Up' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full font-mono text-sm text-gray-400 hover:text-white transition-colors"
        >
          {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </motion.form>

      {/* Scroll Indicator */}
      <motion.div 
        variants={itemVariants} 
        className="absolute bottom-8 animate-bounce"
      >
        <ChevronDown className="text-gray-600" />
      </motion.div>
    </motion.div>
  );
};

export default Hero;
