
import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to log out. Please try again."
        });
      } else {
        localStorage.removeItem('userSession');
        toast({
          title: "Logged out",
          description: "You have been successfully logged out."
        });
        navigate('/');
      }
    } catch (err) {
      console.error('Logout error:', err);
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
    >
      <LogOut size={20} />
      <span className="font-mono">logout</span>
    </button>
  );
};
