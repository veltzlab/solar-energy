import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  password?: string;
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
      theme: 'dark',

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      init: async () => {
        // Auth local — nada a inicializar
      },

      login: async (email, password) => {
        const found = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) return false;
        set({ isAuthenticated: true, user: { email: found.email, name: found.name, role: found.role } });
        return true;
      },

      logout: async () => {
        set({ isAuthenticated: false, user: null });
      },

      fetchUsers: async () => {
        // Já carregado do estado local
      },

      addUser: async ({ name, email, password, role }) => {
        const exists = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return false;
        const newUser: ProfileUser = { id: Date.now().toString(), email, name, role, password };
        set({ users: [...get().users, newUser] });
        return true;
      },

      removeUser: async (email) => {
        if (email === 'admin@solarenergy.com') return;
        set((s) => ({ users: s.users.filter((u) => u.email !== email) }));
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
