
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 6 characters', validator: (p) => p.length >= 6 },
  { label: 'At least 1 number', validator: (p) => /\d/.test(p) },
  { label: 'At least 1 special character', validator: (p) => /[!@#$%^&*]/.test(p) },
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

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    clearError();
  }, [isRegistering, clearError]);

  const resetForm = () => {
    setFormData({ email: '', password: '' });
    setValidationError('');
    setShowRequirements(false);
    clearError();
  };

  const validatePassword = (password: string) => {
    return passwordRequirements.every(req => req.validator(password));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setValidationError('Please fill in all fields');
      return false;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (isRegistering && !validatePassword(formData.password)) {
      setValidationError('Please meet all password requirements');
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
    if (name === 'password' && isRegistering) {
      setShowRequirements(true);
    }
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
