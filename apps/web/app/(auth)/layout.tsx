'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, go home
    const stored =
      token ||
      (typeof window !== 'undefined' ? localStorage.getItem('oikos_token') : null);
    if (stored) router.replace('/');
  }, [token, router]);

  return <>{children}</>;
}
