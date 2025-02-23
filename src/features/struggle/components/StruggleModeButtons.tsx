
import React from 'react';
import { Timer, Target, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StruggleType } from '../services/sessionService';

interface StruggleModeButtonsProps {
  onSelect: (type: StruggleType) => void;
}

export const StruggleModeButtons: React.FC<StruggleModeButtonsProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-6 max-w-3xl w-full px-4">
      <Button
        variant="outline"
        onClick={() => onSelect('pomodoro')}
        className="flex flex-col items-center gap-4 p-6 h-auto aspect-square border-white/20 hover:bg-white hover:text-black transition-colors"
      >
        <Timer className="w-8 h-8" />
        <span className="font-mono">pomodoro</span>
      </Button>

      <Button
        variant="outline"
        onClick={() => onSelect('hard_task')}
        className="flex flex-col items-center gap-4 p-6 h-auto aspect-square border-white/20 hover:bg-white hover:text-black transition-colors"
      >
        <Target className="w-8 h-8" />
        <span className="font-mono">hard task</span>
      </Button>

      <Button
        variant="outline"
        onClick={() => onSelect('deep_focus')}
        className="flex flex-col items-center gap-4 p-6 h-auto aspect-square border-white/20 hover:bg-white hover:text-black transition-colors"
      >
        <Focus className="w-8 h-8" />
        <span className="font-mono">deep focus</span>
      </Button>
    </div>
  );
};
