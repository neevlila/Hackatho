import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define a more descriptive result for the login function
interface LoginResult {
  success: boolean;
  errorType: 'credentials' | 'confirmation' | 'unknown' | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>; // Updated return type
  logout: () => Promise<void>;
  loginAsDemo: () => void;
  isAuthenticated: boolean;
  isDemoUser: boolean;
  resendConfirmationEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    if (isDemoUser) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsDemoUser(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemoUser]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      // Differentiate between error types for better UX
      if (error.message.includes('Email not confirmed')) {
        return { success: false, errorType: 'confirmation' };
      }
      // "Invalid login credentials" falls here
      return { success: false, errorType: 'credentials' };
    }
      
    if (!data.session) {
        // Fallback for unexpected cases
        return { success: false, errorType: 'unknown' };
    }

    setUser(data.user);
    setIsDemoUser(false);
    return { success: true, errorType: null };
  };

  const resendConfirmationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
    return { error };
  };

  const loginAsDemo = () => {
    const mockUser = {
      id: 'demo-user-id',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { name: 'Demo Admin', role: 'admin' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'admin@university.edu',
    } as unknown as User;
    setUser(mockUser);
    setIsDemoUser(true);
  };

  const logout = async () => {
    if (!isDemoUser) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsDemoUser(false);
  };

  const value = {
    user,
    login,
    logout,
    loginAsDemo,
    isAuthenticated: !!user,
    isDemoUser,
    resendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
