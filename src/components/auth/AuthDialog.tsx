
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ isOpen, onOpenChange }: AuthDialogProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = isRegistering 
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/vibe-matching` }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: response.error.message
        });
      } else if (isRegistering) {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link."
        });
        onOpenChange(false);
      } else if (response.data.session) {
        localStorage.setItem('userSession', JSON.stringify(response.data.session));
        onOpenChange(false);
        navigate('/vibe-matching');
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border-2 border-white">
        <DialogTitle className="text-center font-mono text-2xl text-white mb-6">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
