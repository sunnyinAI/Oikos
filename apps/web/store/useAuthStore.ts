import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '@/lib/api';

interface User {
  id: number;
  phone: string;
  name: string;
  language: 'en' | 'hi';
  dark_mode: number;
  dietary_pref: string;
  family_size: number;
  monthly_budget: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  sendOtp: (phone: string) => Promise<{ otp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ user: User }>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.sendOtp(phone);
          set({ isLoading: false });
          return data;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed';
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      verifyOtp: async (phone, otp) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.verifyOtp(phone, otp);
          if (typeof window !== 'undefined') {
            localStorage.setItem('oikos_token', data.token);
          }
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed';
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      logout: async () => {
        try { await api.logout(); } catch { /* no-op */ }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oikos_token');
        }
        set({ user: null, token: null });
      },

      updateProfile: async (data) => {
        const res = await api.updateProfile(data);
        set({ user: res.user });
        return res;
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'oikos-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== 'undefined') {
          localStorage.setItem('oikos_token', state.token);
        }
      },
    },
  ),
);
