
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../utils/sessionStorage';

interface SessionGuardProps {
  children: React.ReactNode;
}

export const SessionGuard = ({ children }: SessionGuardProps) => {
  const navigate = useNavigate();
  const sessionData = getSessionData();

  useEffect(() => {
    // Only redirect if there's no session data at all
    if (!sessionData) {
      navigate('/');
    }
  }, [navigate]);

  // Show loading state only if we're about to redirect
  if (!sessionData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
};
