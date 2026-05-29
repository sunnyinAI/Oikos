import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      language: 'en',
      darkMode: false,
      toasts: [],
      onboardingComplete: false,
      role: null,
      pwaPromptDismissedAt: 0,
      streak: { count: 0, lastDay: null },
      setLanguage: (lang) => set({ language: lang }),
      setRole: (role) => set({ role }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () => set({ onboardingComplete: false }),
      dismissPwaPrompt: () => set({ pwaPromptDismissedAt: Date.now() }),
      bumpStreak: () => set((s) => {
        const todayKey = new Date().toISOString().slice(0, 10);
        if (s.streak.lastDay === todayKey) return {};
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        const continuing = s.streak.lastDay === yKey;
        return {
          streak: {
            count: continuing ? s.streak.count + 1 : 1,
            lastDay: todayKey,
          },
        };
      }),
      toggleDarkMode: () => set((s) => {
        const next = !s.darkMode;
        if (next) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { darkMode: next };
      }),
      setDarkMode: (val) => {
        if (val) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
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
      name: 'kharcha-ui',
      partialize: (s) => ({
        language: s.language,
        darkMode: s.darkMode,
        onboardingComplete: s.onboardingComplete,
        role: s.role,
        pwaPromptDismissedAt: s.pwaPromptDismissedAt,
        streak: s.streak,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) document.documentElement.classList.add('dark');
      },
    }
  )
);
