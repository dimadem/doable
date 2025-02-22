
import React from 'react';
import { StatusIndicatorProps } from '../../types';

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusColors = {
    idle: 'bg-purple-500',
    connecting: 'bg-blue-500',
    processing: 'bg-orange-500',
    responding: 'bg-green-500'
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
      <span className="font-mono text-sm text-gray-400">{status}</span>
    </div>
  );
};

export default StatusIndicator;
