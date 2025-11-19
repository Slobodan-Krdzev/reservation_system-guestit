import { create } from 'zustand';
import type { User } from '../types';
import { api, API_BASE_URL } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  hydrated: boolean;
  error?: string;
  hydrate: () => Promise<void>;
  setCredentials: (payload: { user: User; token: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshSession: () => Promise<boolean>;
}

const TOKEN_KEY = 'rs_token';
const REFRESH_TOKEN_KEY = 'rs_refresh';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  refreshToken:
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null,
  loading: false,
  hydrated: false,
  async hydrate() {
    if (get().hydrated) return;
    const token = get().token;
    const hasRefresh = get().refreshToken;
    if (!token && hasRefresh) {
      const refreshed = await get().refreshSession();
      if (!refreshed) {
        set({ hydrated: true });
        return;
      }
    } else if (!token) {
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
  setCredentials({ user, token, refreshToken }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, token, refreshToken, hydrated: true });
  },
  updateUser(user) {
    set({ user });
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ user: null, token: null, refreshToken: null, hydrated: true });
  },
  async refreshSession() {
    const refreshToken =
      get().refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        throw new Error('Refresh failed');
      }
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      set({ token: data.token, refreshToken: data.refreshToken });
      return true;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      set({ token: null, refreshToken: null, user: null });
      return false;
    }
  },
}));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;
      const refreshed = await useAuthStore.getState().refreshSession();
      if (refreshed) {
        const token = useAuthStore.getState().token;
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      }
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

