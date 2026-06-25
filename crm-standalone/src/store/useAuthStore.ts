import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'vendedor';

export interface User {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (newUser: User) => void;
  removeUser: (email: string) => void;
}

const INITIAL_USERS: User[] = [
  { email: 'admin@solarenergy.com', password: 'solar@2025', name: 'Administrador', role: 'admin' },
  { email: 'vendas@solarenergy.com', password: 'vendas@2025', name: 'Equipe de Vendas', role: 'vendedor' },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      users: INITIAL_USERS,
      theme: 'dark',

      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (user) {
          set({ isAuthenticated: true, user: { ...user, password: '' } });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false, user: null }),

      addUser: (newUser) => {
        const exists = get().users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
        if (exists) return;
        set({ users: [...get().users, newUser] });
      },

      removeUser: (email) => {
        if (email === 'admin@solarenergy.com') return; // Protege o admin principal
        set({ users: get().users.filter(u => u.email !== email) });
      }
    }),
    {
      name: 'solar-crm-auth',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            users: INITIAL_USERS,
            user: null,
            isAuthenticated: false,
          };
        }
        return persistedState;
      },
    }
  )
);
