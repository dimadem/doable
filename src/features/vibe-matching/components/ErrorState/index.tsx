
import React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorStateProps } from '../../types';

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <div className="text-red-500 text-center font-mono">
        {error || 'An error occurred'}
      </div>
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="font-mono"
        >
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
