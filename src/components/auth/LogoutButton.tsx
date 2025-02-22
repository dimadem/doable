
import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const LogoutButton = () => {
  const { signOut, session } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
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
