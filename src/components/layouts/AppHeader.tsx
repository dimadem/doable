import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession } from '@/contexts/SessionContext';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  showBack = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, personalityKey } = useSession();

  const handleBack = () => {
    const direction = -1;
    
    switch (location.pathname) {
      case '/vibe-matching':
        navigate('/', { state: { direction } });
        break;
      case '/struggle':
        navigate('/vibe-matching', { state: { direction } });
        break;
      case '/voice-double':
        navigate('/struggle', { state: { direction } });
        break;
      default:
        navigate(-1);
    }
  };

  const handleContinueJourney = () => {
    const direction = 1;
    // If we have personality data, go directly to struggle page
    if (personalityKey) {
      navigate('/struggle', { state: { direction } });
    } else {
      // Otherwise go to vibe-matching to complete personality assessment
      navigate('/vibe-matching', { state: { direction } });
    }
  };

  return (
    <header className="w-full p-4 md:p-8 flex justify-between items-center shrink-0 relative">
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-mono">back</span>
          </button>
        )}
      </div>

      {title && (
        <h1 className="font-mono text-lg px-4 py-2 bg-white text-black absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {title}
        </h1>
      )}

      <div className="flex items-center">
        {location.pathname === '/' && sessionId && (
          <Button
            variant="outline"
            onClick={handleContinueJourney}
            className="font-mono border-white text-white hover:bg-white hover:text-black"
          >
            Continue Journey
          </Button>
        )}
      </div>
    </header>
  );
};
