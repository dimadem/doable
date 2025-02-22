
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import AuthDialog from '../auth/AuthDialog';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  showStatusDots?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  showBack = true,
  showStatusDots = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="p-4 md:p-8 flex justify-between items-center shrink-0">
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

      <div className="flex items-center gap-4">
        {showStatusDots && (
          <div className="flex gap-2">
            {[1, 2, 3].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-800'}`} 
              />
            ))}
          </div>
        )}
        {title && (
          <h1 className="font-mono text-lg px-4 py-2 bg-white text-black">
            {title}
          </h1>
        )}
      </div>

      <div>
        {location.pathname === '/' ? (
          user ? (
            <Button
              variant="outline"
              onClick={() => navigate('/vibe-matching', { state: { direction: 1 } })}
              className="font-mono border-white text-white hover:bg-white hover:text-black"
            >
              Go to App
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowAuthDialog(true)}
              className="font-mono border-white text-white hover:bg-white hover:text-black"
            >
              Login
            </Button>
          )
        ) : (
          user && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span className="font-mono">logout</span>
            </button>
          )
        )}
      </div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </header>
  );
};
