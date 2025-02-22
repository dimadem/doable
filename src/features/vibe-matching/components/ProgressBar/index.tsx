
import React from 'react';
import { ProgressBarProps } from '../../types';

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
    <div 
      className="h-full bg-white transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default ProgressBar;
