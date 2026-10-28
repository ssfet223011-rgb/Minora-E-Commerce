import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, EditorPermission } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  hasPermission: (permission: EditorPermission) => boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enableDemoAdmin: () => void;
  enableDemoSuperAdmin: () => void;
  enableDemoEditor: () => void;
  enableDemoCustomer: () => void;
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

  const enableDemoSuperAdmin = () => {
    const admin = authService.setDemoSuperAdmin();
    setUser(admin);
  };

  const enableDemoEditor = () => {
    const editor = authService.setDemoEditor();
    setUser(editor);
  };

  const enableDemoCustomer = () => {
    const customer = authService.setDemoCustomer();
    setUser(customer);
  };

  const enableDemoAdmin = enableDemoSuperAdmin;

  const isSuperAdmin = Boolean(
    user && (user.role === 'superadmin' || user.role === 'admin') && user.status === 'active'
  );
  const isEditor = Boolean(user && user.role === 'editor' && user.status === 'active');
  const isStaff = isSuperAdmin || isEditor;
  const isAdmin = isSuperAdmin;
  const isCustomer = Boolean(user && user.role === 'customer');

  const hasPermission = (permission: EditorPermission): boolean => {
    if (!user || user.status !== 'active') return false;
    if (isSuperAdmin) return true; // Superadmin has all authorities
    if (isEditor) {
      // If editor has explicit permissions array, check it; otherwise default allow basic product/category work
      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permission);
      }
      return ['manage_products', 'manage_categories', 'manage_inventory'].includes(permission);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isSuperAdmin,
        isEditor,
        isStaff,
        isCustomer,
        hasPermission,
        signIn,
        signUp,
        signOut,
        enableDemoAdmin,
        enableDemoSuperAdmin,
        enableDemoEditor,
        enableDemoCustomer,
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
