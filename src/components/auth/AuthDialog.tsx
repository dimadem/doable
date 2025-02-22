
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { PasswordInput } from './PasswordInput';
import { validateForm, sanitizeInput, FormData } from './authValidation';

const RATE_LIMIT_DELAY = 1000; // 1 second delay between attempts
const MAX_ATTEMPTS = 5; // Maximum number of login attempts

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ isOpen, onOpenChange }: AuthDialogProps) => {
  const navigate = useNavigate();
  const { signIn, signUp, loading, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({ email: '', password: '' });
    setValidationError('');
    setShowRequirements(false);
    setAttempts(0);
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    clearError();
  }, [isRegistering, clearError]);

  const handleRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastAttemptTime < RATE_LIMIT_DELAY) {
      toast({
        variant: "destructive",
        title: "Please wait",
        description: "Too many attempts. Please try again in a moment."
      });
      return true;
    }
    if (attempts >= MAX_ATTEMPTS) {
      toast({
        variant: "destructive",
        title: "Account locked",
        description: "Too many failed attempts. Please try again later."
      });
      return true;
    }
    setLastAttemptTime(now);
    setAttempts(prev => prev + 1);
    return false;
  }, [attempts, lastAttemptTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm(formData, isRegistering);
    if (!validation.isValid || handleRateLimit()) {
      setValidationError(validation.error || '');
      return;
    }
    
    setIsLoading(true);
    try {
      const sanitizedEmail = sanitizeInput(formData.email);
      const sanitizedPassword = sanitizeInput(formData.password);

      if (isRegistering) {
        await signUp(sanitizedEmail, sanitizedPassword);
        onOpenChange(false);
      } else {
        await signIn(sanitizedEmail, sanitizedPassword, rememberMe);
        onOpenChange(false);
        navigate('/vibe-matching');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    if (name === 'password' && isRegistering) {
      setShowRequirements(true);
    }
    setValidationError('');
    if (authError) clearError();
  }, [authError, clearError, isRegistering]);

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
              maxLength={100}
            />
          </div>

          <PasswordInput
            value={formData.password}
            onChange={handleInputChange}
            isRegistering={isRegistering}
            showRequirements={showRequirements}
            disabled={isLoading}
            onFocus={() => isRegistering && setShowRequirements(true)}
          />

          {!isRegistering && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-white bg-transparent text-white focus:ring-white"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-400 font-mono">
                Remember me
              </label>
            </div>
          )}

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
            onClick={() => {
              setIsRegistering(!isRegistering);
              resetForm();
            }}
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
