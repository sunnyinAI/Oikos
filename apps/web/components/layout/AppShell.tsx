'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import { useOffline } from '@/hooks/useOffline';
import ToastProvider from '@/components/ui/ToastProvider';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Oikos',
  '/grocery': 'Grocery List',
  '/prices': 'Price Compare',
  '/pantry': 'Pantry',
  '/finance': 'Finance',
  '/mandi': 'Mandi Prices',
  '/meals': 'Meal Planner',
  '/assistant': 'Ask Oikos',
  '/settings': 'Settings',
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOffline = useOffline();
  const title = PAGE_TITLES[pathname] || 'Oikos';

  return (
    <div className="flex flex-col min-h-screen min-h-dvh">
      <TopBar title={title} />
      {isOffline && (
        <div className="bg-amber-500 text-white text-xs text-center py-1 px-4">
          You&apos;re offline — some features may not be available
        </div>
      )}
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
      <ToastProvider />
    </div>
  );
}
