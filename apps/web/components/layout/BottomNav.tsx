'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingCart, TrendingUp, Package, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';

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
  { to: '/assistant', label: 'Ask Oikos', labelHi: 'पूछो', icon: '🤖' },
  { to: '/settings', label: 'Settings', labelHi: 'सेटिंग्स', icon: '⚙️' },
];

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const { language } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {MORE_ITEMS.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => {
                      router.push(item.to);
                      setShowMore(false);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
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

      <nav className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-30 safe-bottom">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ to, icon: Icon, label, labelHi }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                  isActive
                    ? 'text-saffron-500 dark:text-saffron-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="font-medium">{language === 'hi' ? labelHi : label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
              showMore ? 'text-saffron-500' : 'text-gray-400 dark:text-gray-500'
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
