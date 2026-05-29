'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import AppShell from '@/components/layout/AppShell';

function SyncPreferences() {
  const user = useAuthStore((s) => s.user);
  const setDarkMode = useUIStore((s) => s.setDarkMode);
  const setLanguage = useUIStore((s) => s.setLanguage);

  useEffect(() => {
    if (user?.language) setLanguage(user.language);
    if (user?.dark_mode !== undefined && user?.dark_mode !== null) {
      setDarkMode(Boolean(user.dark_mode));
    }
  }, [user?.dark_mode, user?.language, setDarkMode, setLanguage]);

  return null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    const stored =
      token ||
      (typeof window !== 'undefined' ? localStorage.getItem('omni_token') : null);
    if (!stored) router.replace('/login');
  }, [token, router]);

  return (
    <>
      <SyncPreferences />
      <AppShell>{children}</AppShell>
    </>
  );
}
