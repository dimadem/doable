
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '@/utils/sessionUtils';

interface SessionGuardProps {
  children: React.ReactNode;
}

export const SessionGuard = ({ children }: SessionGuardProps) => {
  const navigate = useNavigate();
  const sessionData = getSessionData();

  useEffect(() => {
    if (!sessionData?.sessionId) {
      navigate('/');
    }
  }, [navigate]);

  if (!sessionData?.sessionId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
};
