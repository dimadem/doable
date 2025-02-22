
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { toast } from "@/components/ui/use-toast";

interface SessionGuardProps {
  children: React.ReactNode;
}

export const SessionGuard = ({ children }: SessionGuardProps) => {
  const navigate = useNavigate();
  const { sessionId, loading } = useSession();

  useEffect(() => {
    if (!loading && !sessionId) {
      toast({
        variant: "destructive",
        title: "Session Required",
        description: "Please start your journey from the home page."
      });
      navigate('/');
    }
  }, [sessionId, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white">Loading...</div>
      </div>
    );
  }

  return sessionId ? <>{children}</> : null;
};
