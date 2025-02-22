
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ isOpen, onOpenChange }: AuthDialogProps) => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        await signUp(email, password);
        onOpenChange(false);
      } else {
        await signIn(email, password);
        onOpenChange(false);
        navigate('/vibe-matching');
      }
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-mono bg-transparent border-2 border-white text-white placeholder:text-gray-400"
            required
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-mono px-8 py-4 bg-black text-white border-2 border-white 
                     font-bold text-lg transition-all duration-300 hover:bg-white hover:text-black
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
          
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full font-mono text-sm text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
