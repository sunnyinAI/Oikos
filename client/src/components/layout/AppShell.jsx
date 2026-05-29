import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import { useOffline } from '../../hooks/useOffline';
import ToastProvider from '../ui/ToastProvider';
import InstallPrompt from '../ui/InstallPrompt';
import PushPermissionBanner from '../ui/PushPermissionBanner';

const PAGE_TITLES = {
  '/': 'Omni',
  '/grocery': 'Grocery List',
  '/prices': 'Price Compare',
  '/pantry': 'Pantry',
  '/finance': 'Finance',
  '/mandi': 'Mandi Prices',
  '/meals': 'Meal Planner',
  '/assistant': 'Ask Omni',
  '/collaborate': 'Share List',
  '/settings': 'Settings',
};

export default function AppShell() {
  const location = useLocation();
  const isOffline = useOffline();
  const title = PAGE_TITLES[location.pathname] || 'Omni';

  return (
    <div className="flex flex-col min-h-screen min-h-dvh">
      <TopBar title={title} />
      {isOffline && (
        <div className="bg-accent-500 text-white text-xs font-medium text-center py-1.5 px-4">
          You're offline — some features may not be available
        </div>
      )}
      <PushPermissionBanner />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <InstallPrompt />
      <ToastProvider />
    </div>
  );
}
