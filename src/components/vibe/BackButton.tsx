
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
  >
    <ArrowLeft size={20} />
    <span className="font-mono">back</span>
  </button>
);
