import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, TrendingUp, Package, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home', labelHi: 'होम' },
  { to: '/grocery', icon: ShoppingCart, label: 'Grocery', labelHi: 'किराना' },
  { to: '/prices', icon: TrendingUp, label: 'Prices', labelHi: 'दाम' },
  { to: '/pantry', icon: Package, label: 'Pantry', labelHi: 'पैंट्री' },
];

const MORE_ITEMS = [
  { to: '/finance', label: 'Finance', labelHi: 'हिसाब', icon: '💰' },
  { to: '/mandi', label: 'Mandi', labelHi: 'मंडी', icon: '🌾' },
  { to: '/meals', label: 'Meal Planner', labelHi: 'खाना', icon: '🍽️' },
  { to: '/assistant', label: 'Ask Kharcha', labelHi: 'पूछो', icon: '🤖' },
  { to: '/settings', label: 'Settings', labelHi: 'सेटिंग्स', icon: '⚙️' },
];

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const { language } = useUIStore();
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {MORE_ITEMS.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => { navigate(item.to); setShowMore(false); }}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-brand-50/70 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700/60 last:border-0"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {language === 'hi' ? item.labelHi : item.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="sticky bottom-0 glass border-t border-gray-200/60 dark:border-gray-800/60 z-30 safe-bottom">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ to, icon: Icon, label, labelHi }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-300'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute top-1.5 h-1 w-8 rounded-full bg-brand-500"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="font-medium">{language === 'hi' ? labelHi : label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
              showMore ? 'text-brand-600 dark:text-brand-300' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <MoreHorizontal size={22} strokeWidth={showMore ? 2.5 : 1.8} />
            <span className="font-medium">{language === 'hi' ? 'और' : 'More'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
