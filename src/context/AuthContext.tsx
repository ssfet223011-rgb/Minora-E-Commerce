import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enableDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const current = await authService.getCurrentUser();
        setUser(current);
      } catch (e) {
        console.error('Failed to restore user session', e);
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    const result = await authService.signInWithEmail(email, password);
    setLoading(false);
    if (result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Login failed' };
  };

  const signUp = async (email: string, password?: string, fullName?: string, phone?: string) => {
    setLoading(true);
    const result = await authService.signUpWithEmail(email, password, fullName, phone);
    setLoading(false);
    if (result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Signup failed' };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const enableDemoAdmin = () => {
    const admin = authService.setDemoAdmin();
    setUser(admin);
  };

  const isAdmin = Boolean(user && user.role === 'admin' && user.status === 'active');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        enableDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
