
import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Session } from '@supabase/supabase-js';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Clear local storage and redirect when session ends
        localStorage.removeItem('userSession');
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Get current session before attempting logout
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No active session found. Please log in again."
        });
        navigate('/');
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to log out. Please try again."
        });
      } else {
        // Session cleanup happens in onAuthStateChange
        toast({
          title: "Logged out",
          description: "You have been successfully logged out."
        });
      }
    } catch (err) {
      console.error('Unexpected logout error:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      disabled={!session}
    >
      <LogOut size={20} />
      <span className="font-mono">logout</span>
    </button>
  );
};
