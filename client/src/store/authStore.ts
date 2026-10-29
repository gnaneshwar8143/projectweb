import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { User, AuthState } from '../types';

interface AuthActions {
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const saved = (() => {
  try {
    const token = localStorage.getItem('wc_token');
    const user = localStorage.getItem('wc_user');
    if (token && user) return { token, user: JSON.parse(user) as User };
  } catch { /* ignore */ }
  return null;
})();

export const useAuthStore = create<AuthStore>()(
  immer((set) => ({
    user: saved?.user ?? null,
    token: saved?.token ?? null,
    isLoading: false,
    isAuthenticated: !!saved?.token,

    setAuth: (user, token) => {
      localStorage.setItem('wc_token', token);
      localStorage.setItem('wc_user', JSON.stringify(user));
      set(s => {
        s.user = user;
        s.token = token;
        s.isAuthenticated = true;
        s.isLoading = false;
      });
    },

    logout: () => {
      localStorage.removeItem('wc_token');
      localStorage.removeItem('wc_user');
      set(s => {
        s.user = null;
        s.token = null;
        s.isAuthenticated = false;
      });
    },

    setLoading: (v) => set(s => { s.isLoading = v; }),
  }))
);
