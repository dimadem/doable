
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  persistSession: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setPersistSession: (persist: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    error: null,
    persistSession: false
  });

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const setPersistSession = useCallback((persist: boolean) => {
    setAuthState(prev => ({ ...prev, persistSession: persist }));
    localStorage.setItem('persistSession', persist ? 'true' : 'false');
  }, []);

  useEffect(() => {
    // Load persistence preference
    const persistSession = localStorage.getItem('persistSession') === 'true';
    setAuthState(prev => ({ ...prev, persistSession }));

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthError = useCallback((error: any) => {
    const errorMessage = error?.message || 'An unexpected error occurred';
    setAuthState(prev => ({ ...prev, error: errorMessage }));
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: errorMessage
    });
    throw error;
  }, []);

  const signIn = async (email: string, password: string, remember: boolean = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          persistSession: remember || authState.persistSession
        }
      });
      if (error) throw error;
      setPersistSession(remember);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/vibe-matching`,
          data: {
            created_at: new Date().toISOString(),
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Welcome!",
        description: "Please check your email to verify your account."
      });
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setPersistSession(false);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signIn,
      signUp,
      signOut,
      clearError,
      setPersistSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
