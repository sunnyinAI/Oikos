'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { joinList } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

export default function JoinListPage() {
  const params = useParams();
  const shareCode = (params?.shareCode as string) || '';
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { addToast } = useUIStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!shareCode) { setStatus('error'); setMessage('Share code is missing.'); return; }

    const stored = token || (typeof window !== 'undefined' ? localStorage.getItem('omni_token') : null);
    if (!stored) {
      if (typeof window !== 'undefined') sessionStorage.setItem('pendingShareCode', shareCode);
      router.replace('/login');
      return;
    }

    let active = true;
    (joinList(shareCode.toUpperCase()) as Promise<{ message: string }>)
      .then((res) => {
        if (!active) return;
        setStatus('success');
        setMessage(res.message || 'Joined list successfully');
        if (typeof window !== 'undefined') sessionStorage.removeItem('pendingShareCode');
        addToast('Shared grocery list linked', 'success');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to join list');
      });
    return () => { active = false; };
  }, [addToast, router, shareCode, token]);

  return (
    <div className="mx-auto flex min-h-screen min-h-dvh max-w-[480px] items-center px-6 py-10">
      <Card className="w-full px-5 py-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center py-6 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Connecting to shared list code{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">{shareCode.toUpperCase()}</span>
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kgreen-50 text-kgreen-600 dark:bg-kgreen-900/20 dark:text-kgreen-300">
              <CheckCircle2 size={26} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">Shared list connected</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/grocery">
                <Button className="w-full"><ShoppingCart size={16} /> Open Grocery Lists</Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" className="w-full">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-300">
              <span className="text-2xl">!</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">Couldn&apos;t join this list</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/grocery">
                <Button variant="secondary" className="w-full">Open My Lists</Button>
              </Link>
              <Link href="/settings">
                <Button className="w-full">Try Another Share Code</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
