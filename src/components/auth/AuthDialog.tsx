
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ isOpen, onOpenChange }: AuthDialogProps) => {
  const navigate = useNavigate();
  const { signIn, signUp, loading: authLoading, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Clear form and errors when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '' });
      setValidationError('');
      clearError();
    }
  }, [isOpen, clearError]);

  // Clear auth error when switching modes
  useEffect(() => {
    clearError();
  }, [isRegistering, clearError]);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setValidationError('Please fill in all fields');
      return false;
    }
    if (!formData.email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (isRegistering) {
        await signUp(formData.email, formData.password);
        onOpenChange(false);
      } else {
        await signIn(formData.email, formData.password);
        onOpenChange(false);
        navigate('/vibe-matching');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
    if (authError) clearError();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
      <DialogContent className="sm:max-w-md bg-black border-2 border-white">
        <DialogTitle className="text-center font-mono text-2xl text-white mb-6">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="font-mono bg-transparent border-2 border-white text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
              aria-label="Email"
            />
          </div>

          <div className="space-y-2 relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="font-mono bg-transparent border-2 border-white text-white placeholder:text-gray-400 pr-10"
              required
              disabled={isLoading}
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {(validationError || authError) && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm font-mono"
            >
              {validationError || authError}
            </motion.p>
          )}
          
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full font-mono px-8 py-4 bg-black text-white border-2 border-white 
                     font-bold text-lg transition-all duration-300 hover:bg-white hover:text-black
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLoading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </motion.button>
          
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
