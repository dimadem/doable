
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../utils/sessionStorage';
import { useToast } from '@/hooks/use-toast';

interface SessionGuardProps {
  children: React.ReactNode;
}

export const SessionGuard = ({ children }: SessionGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 200; // 200ms between retries

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
        toast({
          title: "Session Error",
          description: "No valid session found. Redirecting to home.",
          variant: "destructive",
        });
        navigate('/', { replace: true });
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [navigate, toast]);

  if (isValidating) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white">Validating session...</div>
      </div>
    );
  }

  return hasSession ? <>{children}</> : null;
};
