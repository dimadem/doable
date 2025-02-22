
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to access this page."
      });
      navigate('/');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="font-mono text-white">Loading...</div>
      </div>
    );
  }

  return session ? <>{children}</> : null;
};
