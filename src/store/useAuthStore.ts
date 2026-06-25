import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'vendedor';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  canManageBlog?: boolean;
}

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  canManageBlog?: boolean;
  mustChangePassword?: boolean;
}

export type LoginResult = 'invalid' | 'must-change-password' | 'success';

export const DEFAULT_PASSWORD = 'solar123';

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  users: ProfileUser[];
  pendingUser: ProfileUser | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeFirstLogin: (newPassword: string) => Promise<boolean>;
  cancelFirstLogin: () => void;
  logout: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  addUser: (data: { name: string; email: string; role: UserRole; canManageBlog?: boolean }) => Promise<boolean>;
  removeUser: (email: string) => Promise<void>;
  setBlogAccess: (email: string, allowed: boolean) => void;
}

const INITIAL_USERS: ProfileUser[] = [
  { id: '1', email: 'admin@solarenergy.com', password: 'solar@2025', name: 'Administrador', role: 'admin' },
  { id: '2', email: 'vendas@solarenergy.com', password: 'vendas@2025', name: 'Equipe de Vendas', role: 'vendedor' },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      users: INITIAL_USERS,
      pendingUser: null,
      theme: 'dark',

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      init: async () => {
        // Auth local — nada a inicializar
      },

      login: async (email, password) => {
        const found = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) return 'invalid';
        if (found.mustChangePassword) {
          set({ pendingUser: found });
          return 'must-change-password';
        }
        set({
          isAuthenticated: true,
          user: { email: found.email, name: found.name, role: found.role, canManageBlog: found.canManageBlog ?? false },
        });
        return 'success';
      },

      completeFirstLogin: async (newPassword) => {
        const pending = get().pendingUser;
        if (!pending) return false;
        set((s) => ({
          users: s.users.map((u) => u.email === pending.email ? { ...u, password: newPassword, mustChangePassword: false } : u),
          isAuthenticated: true,
          user: { email: pending.email, name: pending.name, role: pending.role, canManageBlog: pending.canManageBlog ?? false },
          pendingUser: null,
        }));
        return true;
      },

      cancelFirstLogin: () => {
        set({ pendingUser: null });
      },

      logout: async () => {
        set({ isAuthenticated: false, user: null });
      },

      fetchUsers: async () => {
        // Já carregado do estado local
      },

      addUser: async ({ name, email, role, canManageBlog }) => {
        const exists = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return false;
        const newUser: ProfileUser = {
          id: Date.now().toString(),
          email,
          name,
          role,
          password: DEFAULT_PASSWORD,
          canManageBlog,
          mustChangePassword: true,
        };
        set({ users: [...get().users, newUser] });
        return true;
      },

      removeUser: async (email) => {
        if (email === 'admin@solarenergy.com') return;
        set((s) => ({ users: s.users.filter((u) => u.email !== email) }));
      },

      setBlogAccess: (email, allowed) => {
        set((s) => ({
          users: s.users.map((u) => (u.email === email ? { ...u, canManageBlog: allowed } : u)),
          user: s.user?.email === email ? { ...s.user, canManageBlog: allowed } : s.user,
        }));
      },
    }),
    {
      name: 'solar-crm-auth-v2',
      version: 1,
      partialize: (s) => ({
        theme: s.theme,
        users: s.users,
        isAuthenticated: s.isAuthenticated,
        user: s.user,
      }),
      // Corrige navegadores com `users` vazio/corrompido salvo de versões anteriores
      migrate: (persistedState, version) => {
        const state = persistedState as { theme?: 'dark' | 'light'; users?: ProfileUser[] };
        if (version < 1 || !state.users || state.users.length === 0) {
          return { theme: state.theme ?? 'dark', users: INITIAL_USERS, isAuthenticated: false, user: null };
        }
        return { theme: state.theme ?? 'dark', users: state.users, isAuthenticated: false, user: null };
      },
    }
  )
);
