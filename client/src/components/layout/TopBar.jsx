import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

const TOP_LEVEL_PAGES = ['/', '/grocery', '/prices', '/pantry', '/finance'];

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isTopLevel = TOP_LEVEL_PAGES.includes(location.pathname);

  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-200/60 dark:border-gray-800/60 px-4 py-3 flex items-center gap-3">
      {!isTopLevel && (
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      )}
      {isTopLevel && (
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <span className="text-base font-extrabold text-white drop-shadow-sm">Ω</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-900">
              ₹
            </span>
          </div>
        </div>
      )}
      <h1 className="flex-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
      <button
        onClick={() => navigate('/settings')}
        className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-500 dark:text-gray-400" />
      </button>
    </header>
  );
}
