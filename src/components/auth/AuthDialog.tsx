import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

const RATE_LIMIT_DELAY = 1000; // 1 second delay between attempts
const MAX_ATTEMPTS = 5; // Maximum number of login attempts

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', validator: (p) => p.length >= 8 },
  { label: 'At least 1 number', validator: (p) => /\d/.test(p) },
  { label: 'At least 1 special character', validator: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(p) },
  { label: 'At least 1 uppercase letter', validator: (p) => /[A-Z]/.test(p) },
  { label: 'At least 1 lowercase letter', validator: (p) => /[a-z]/.test(p) },
];

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

  const validatePassword = useCallback((password: string) => {
    return passwordRequirements.every(req => req.validator(password));
  }, []);

  const sanitizeInput = useCallback((input: string) => {
    return input.trim().replace(/[<>]/g, '');
  }, []);

  const validateForm = useCallback(() => {
    const sanitizedEmail = sanitizeInput(formData.email);
    const sanitizedPassword = sanitizeInput(formData.password);

    if (!sanitizedEmail || !sanitizedPassword) {
      setValidationError('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (isRegistering && !validatePassword(sanitizedPassword)) {
      setValidationError('Please meet all password requirements');
      return false;
    }

    setValidationError('');
    return true;
  }, [formData.email, formData.password, isRegistering, validatePassword, sanitizeInput]);

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
    if (!validateForm() || handleRateLimit()) return;
    
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
  }, [authError, clearError, isRegistering, sanitizeInput]);

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

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => isRegistering && setShowRequirements(true)}
                className="font-mono bg-transparent border-2 border-white text-white placeholder:text-gray-400 pr-10"
                required
                disabled={isLoading}
                aria-label="Password"
                maxLength={100}
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

            <AnimatePresence>
              {isRegistering && showRequirements && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 mt-2"
                >
                  {passwordRequirements.map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div 
                        className={`w-2 h-2 rounded-full transition-colors ${
                          req.validator(formData.password) ? 'bg-green-500' : 'bg-gray-400'
                        }`} 
                      />
                      <span className="text-sm text-gray-400 font-mono">
                        {req.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
