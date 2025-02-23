
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../utils/sessionStorage';

interface SessionGuardProps {
  children: React.ReactNode;
}

export const SessionGuard = ({ children }: SessionGuardProps) => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 100; // 100ms between retries

    const validateSession = async () => {
      while (retryCount < maxRetries) {
        const sessionData = getSessionData();
        
        if (!mounted) return;

        if (sessionData?.sessionId) {
          setHasSession(true);
          setIsValidating(false);
          return;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      // If we get here, we've exhausted retries and still no session
      if (mounted) {
        setHasSession(false);
        setIsValidating(false);
        navigate('/');
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white">Validating session...</div>
      </div>
    );
  }

  // Show children only if we have a valid session
  return hasSession ? <>{children}</> : null;
};
