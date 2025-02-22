
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { PasswordRequirements } from './PasswordRequirements';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRegistering: boolean;
  showRequirements: boolean;
  disabled: boolean;
  onFocus?: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  isRegistering,
  showRequirements,
  disabled,
  onFocus
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          className="font-mono bg-transparent border-2 border-white text-white placeholder:text-gray-400 pr-10"
          required
          disabled={disabled}
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
        {isRegistering && (
          <PasswordRequirements 
            password={value} 
            show={showRequirements} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
