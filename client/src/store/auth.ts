import { create } from 'zustand';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  error?: string;
  hydrate: () => Promise<void>;
  setCredentials: (payload: { user: User; token: string }) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const TOKEN_KEY = 'rs_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  loading: false,
  hydrated: false,
  async hydrate() {
    if (get().hydrated) return;
    const token = get().token;
    if (!token) {
      set({ hydrated: true });
      return;
    }
    set({ loading: true });
    try {
      const { data } = await api.get('/me');
      set({ user: data.user, loading: false, hydrated: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, loading: false, hydrated: true });
    }
  },
  setCredentials({ user, token }) {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, hydrated: true });
  },
  updateUser(user) {
    set({ user });
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, hydrated: true });
  },
}));

