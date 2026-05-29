import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface UIState {
  language: 'en' | 'hi';
  darkMode: boolean;
  toasts: Toast[];
  setLanguage: (lang: 'en' | 'hi') => void;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      darkMode: false,
      toasts: [],

      setLanguage: (lang) => set({ language: lang }),

      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode;
          if (typeof document !== 'undefined') {
            if (next) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
          }
          return { darkMode: next };
        }),

      setDarkMode: (val) => {
        if (typeof document !== 'undefined') {
          if (val) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
        set({ darkMode: val });
      },

      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 3000);
      },

      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'omni-ui',
      partialize: (s) => ({ language: s.language, darkMode: s.darkMode }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode && typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      },
    },
  ),
);
