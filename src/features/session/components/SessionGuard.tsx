
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { useToast } from '@/hooks/use-toast';

interface SessionGuardProps {
  children: React.ReactNode;
}

export const SessionGuard = ({ children }: SessionGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionId, loading, error } = useSession();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!sessionId) {
        toast({
          title: "Session Error",
          description: "No valid session found. Redirecting to home.",
          variant: "destructive",
        });
        navigate('/', { replace: true });
      }
      setIsValidating(false);
    }
  }, [loading, sessionId, navigate, toast]);

  if (loading || isValidating) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white">Validating session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white text-center">
          <p>Session Error</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return sessionId ? <>{children}</> : null;
};
