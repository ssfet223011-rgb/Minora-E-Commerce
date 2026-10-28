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
        role: cleanEmail.includes('admin') ? 'superadmin' : cleanEmail.includes('editor') ? 'editor' : 'customer',
        status: 'active',
        permissions: cleanEmail.includes('editor')
          ? ['manage_products', 'manage_categories', 'manage_inventory']
          : undefined,
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

  // EDITORS MANAGEMENT (Super Admin authority only)
  async getEditors(): Promise<UserProfile[]> {
    const users = await this.getUsers();
    return users.filter((u) => u.role === 'editor');
  },

  async updateSuperAdmin(data: {
    full_name: string;
    email: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const users = await this.getUsers();
    const cleanEmail = data.email.toLowerCase().trim();

    let superAdmin = users.find((u) => u.role === 'superadmin' || u.id === 'user-admin-1');
    if (!superAdmin) {
      superAdmin = {
        id: 'user-admin-1',
        email: cleanEmail,
        full_name: data.full_name.trim(),
        phone: data.phone?.trim() || '',
        role: 'superadmin',
        status: 'active',
        permissions: ['manage_products', 'manage_categories', 'manage_orders', 'manage_inventory', 'view_reports'],
        created_at: new Date().toISOString(),
      };
      users.unshift(superAdmin);
    } else {
      superAdmin.email = cleanEmail;
      superAdmin.full_name = data.full_name.trim();
      superAdmin.phone = data.phone?.trim() || '';
      superAdmin.updated_at = new Date().toISOString();
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(superAdmin));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            email: cleanEmail,
            full_name: superAdmin.full_name,
            phone: superAdmin.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', superAdmin.id);
      } catch (e) {
        console.warn('Supabase update super admin exception', e);
      }
    }

    return { success: true };
  },

  async createEditor(data: {
    email: string;
    full_name: string;
    phone?: string;
    permissions: string[];
  }): Promise<{ success: boolean; editor?: UserProfile; error?: string }> {
    const cleanEmail = data.email.toLowerCase().trim();
    const users = await this.getUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A staff or customer account with this email already exists.' };
    }

    const newEditor: UserProfile = {
      id: 'ed_' + Date.now(),
      email: cleanEmail,
      full_name: data.full_name.trim(),
      phone: data.phone?.trim() || '',
      role: 'editor',
      status: 'active',
      permissions: (data.permissions as any) || ['manage_products', 'manage_categories', 'manage_inventory'],
      created_at: new Date().toISOString(),
    };

    users.unshift(newEditor);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').insert({
          id: newEditor.id,
          email: newEditor.email,
          full_name: newEditor.full_name,
          phone: newEditor.phone,
          role: 'editor',
          status: 'active',
        });
      } catch (e) {
        console.warn('Supabase create editor exception', e);
      }
    }

    return { success: true, editor: newEditor };
  },

  async updateEditor(
    editorId: string,
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; editor?: UserProfile; error?: string }> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === editorId);
    if (idx === -1) return { success: false, error: 'Editor not found.' };

    const updated = {
      ...users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    users[idx] = updated;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // If current logged in user is this editor, sync their session
    const current = await this.getCurrentUser();
    if (current?.id === editorId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.full_name,
            phone: updated.phone,
            status: updated.status,
            role: updated.role,
          })
          .eq('id', editorId);
      } catch (e) {
        console.warn('Supabase update editor exception', e);
      }
    }

    return { success: true, editor: updated };
  },

  async deleteEditor(editorId: string): Promise<boolean> {
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== editorId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', editorId);
      } catch (e) {
        console.warn('Supabase delete editor exception', e);
      }
    }

    return true;
  },

  // Helpers for quick demo/testing
  setDemoSuperAdmin(): UserProfile {
    const adminUser: UserProfile = {
      id: 'user-admin-1',
      email: 'admin@minora.com',
      full_name: 'Minora Super Admin',
      phone: '+880 1838 384488',
      role: 'superadmin',
      status: 'active',
      permissions: ['manage_products', 'manage_categories', 'manage_orders', 'manage_inventory', 'view_reports'],
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
    return adminUser;
  },

  setDemoEditor(): UserProfile {
    const editorUser: UserProfile = {
      id: 'user-editor-1',
      email: 'editor@minora.com',
      full_name: 'Minora Catalog Editor',
      phone: '+880 1812 345678',
      role: 'editor',
      status: 'active',
      permissions: ['manage_products', 'manage_categories', 'manage_inventory'],
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(editorUser));
    return editorUser;
  },

  setDemoCustomer(): UserProfile {
    const customerUser: UserProfile = {
      id: 'user-cust-1',
      email: 'customer@minora.com',
      full_name: 'Tanvir Hossain (Customer)',
      phone: '01712345678',
      role: 'customer',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(customerUser));
    return customerUser;
  },

  // Backward compatibility alias
  setDemoAdmin(): UserProfile {
    return this.setDemoSuperAdmin();
  },
};
