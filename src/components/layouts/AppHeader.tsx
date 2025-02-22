
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import AuthDialog from '../auth/AuthDialog';

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
