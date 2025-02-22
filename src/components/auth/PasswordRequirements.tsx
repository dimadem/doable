
import React from 'react';
import { motion } from 'framer-motion';

export interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', validator: (p) => p.length >= 8 },
  { label: 'At least 1 number', validator: (p) => /\d/.test(p) },
  { label: 'At least 1 special character', validator: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(p) },
  { label: 'At least 1 uppercase letter', validator: (p) => /[A-Z]/.test(p) },
  { label: 'At least 1 lowercase letter', validator: (p) => /[a-z]/.test(p) },
];

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, show }) => {
  if (!show) return null;

  return (
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
              req.validator(password) ? 'bg-green-500' : 'bg-gray-400'
            }`} 
          />
          <span className="text-sm text-gray-400 font-mono">
            {req.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};
