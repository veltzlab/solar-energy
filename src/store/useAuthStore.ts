import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, supabaseIsolated } from '../lib/supabase';

export type UserRole = 'admin' | 'vendedor';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  users: ProfileUser[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  addUser: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<boolean>;
  removeUser: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      users: [],
      theme: 'dark',

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      init: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .single();
        if (!profile) return;
        set({
          isAuthenticated: true,
          user: { email: session.user.email!, name: profile.name, role: profile.role as UserRole },
        });
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return false;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', data.user.id)
          .single();
        if (!profile) {
          await supabase.auth.signOut();
          return false;
        }
        set({
          isAuthenticated: true,
          user: { email: data.user.email!, name: profile.name, role: profile.role as UserRole },
        });
        return true;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ isAuthenticated: false, user: null });
      },

      fetchUsers: async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .order('name');
        if (data) set({ users: data as ProfileUser[] });
      },

      addUser: async ({ name, email, password, role }) => {
        const { data, error } = await supabaseIsolated.auth.signUp({ email, password });
        if (error || !data.user) return false;
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, name, email, role });
        if (profileError) return false;
        await get().fetchUsers();
        return true;
      },

      removeUser: async (email) => {
        await supabase.from('profiles').delete().eq('email', email);
        set((s) => ({ users: s.users.filter((u) => u.email !== email) }));
      },
    }),
    {
      name: 'solar-crm-theme',
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);
