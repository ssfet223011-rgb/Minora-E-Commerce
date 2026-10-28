import { UserProfile, UserStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_USERS } from './initialData';

const CURRENT_USER_KEY = 'minora_current_user';
const USERS_STORAGE_KEY = 'minora_users';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) return profile as UserProfile;
        }
      } catch (err) {
        console.warn('Supabase auth session error', err);
      }
    }

    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async signInWithEmail(email: string, _password?: string): Promise<{ user?: UserProfile; error?: string }> {
    if (isSupabaseConfigured && _password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _password,
        });
        if (error) return { error: error.message };
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
            return { user: profile as UserProfile };
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        return { error: msg };
      }
    }

    // Local authentication
    const users = await this.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Auto-register demo customer if not existing
      user = {
        id: 'usr_' + Date.now(),
        email: cleanEmail,
        full_name: cleanEmail.split('@')[0],
        role: cleanEmail.includes('admin') ? 'admin' : 'customer',
        status: 'active',
        created_at: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    if (user.status === 'suspended') {
      return { error: 'Your account has been suspended. Please contact customer support.' };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { user };
  },

  async signUpWithEmail(
    email: string,
    password?: string,
    fullName?: string,
    phone?: string
  ): Promise<{ user?: UserProfile; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName || cleanEmail.split('@')[0],
              phone: phone || '',
            },
          },
        });
        if (error) return { error: error.message };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: fullName || cleanEmail.split('@')[0],
            phone: phone || '',
            role: 'customer',
            status: 'active',
            created_at: new Date().toISOString(),
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
          return { user: profile };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Signup failed';
        return { error: msg };
      }
    }

    const users = await this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { error: 'An account with this email address already exists.' };
    }

    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email: cleanEmail,
      full_name: fullName?.trim() || cleanEmail.split('@')[0],
      phone: phone?.trim() || '',
      role: 'customer',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { user: newUser };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error', e);
      }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  async getUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as UserProfile[];
      } catch (e) {
        console.warn('Supabase fetch users failed', e);
      }
    }

    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  async updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
    const users = await this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    user.status = status;
    user.updated_at = new Date().toISOString();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ status }).eq('id', userId);
      } catch (e) {
        console.warn('Supabase user status update failed', e);
      }
    }

    return true;
  },

  // Helper for quick demo/testing
  setDemoAdmin(): UserProfile {
    const adminUser: UserProfile = {
      id: 'user-admin-1',
      email: 'admin@minora.com',
      full_name: 'Minora Super Admin',
      phone: '+880 1838 384488',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
    return adminUser;
  },
};
