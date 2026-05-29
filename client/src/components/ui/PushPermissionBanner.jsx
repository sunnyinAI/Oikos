import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { enablePush, isPushAvailable } from '../../lib/push';
import { useUIStore } from '../../store/useUIStore';

const STORAGE_KEY = 'oikos_push_dismissed_at';
const SHOW_AFTER_MS = 8000;
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

export default function PushPermissionBanner() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const { language, addToast } = useUIStore();

  useEffect(() => {
    let cancelled = false;
    let timer;

    (async () => {
      if (typeof window === 'undefined') return;
      if (typeof Notification === 'undefined') return;
      if (Notification.permission === 'granted' && localStorage.getItem('oikos_push_token')) return;
      if (Notification.permission === 'denied') return;
      const dismissedAt = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      if (dismissedAt && Date.now() - dismissedAt < COOLDOWN_MS) return;
      const { available } = await isPushAvailable();
      if (!available || cancelled) return;
      timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const onEnable = async () => {
    setBusy(true);
    try {
      await enablePush();
      addToast(language === 'hi' ? 'नोटिफ़िकेशन चालू ✓' : 'Notifications on ✓', 'success');
      setVisible(false);
    } catch (err) {
      addToast(err.message || 'Could not enable', 'error');
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="sticky top-0 z-30 px-4 pt-2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-3 shadow-card dark:border-accent-900/40 dark:bg-accent-900/20">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white">
              <Bell size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {language === 'hi' ? 'दाम कम हो तो बताएं?' : 'Get price-drop & expiry alerts?'}
              </p>
              <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                {language === 'hi'
                  ? 'Atta सस्ता होते ही, पैंट्री आइटम खराब होने से पहले'
                  : 'When atta gets cheaper, before milk goes bad'}
              </p>
            </div>
            <button
              onClick={onEnable}
              disabled={busy}
              className="rounded-xl bg-accent-500 px-3 py-2 text-xs font-semibold text-white shadow-soft hover:bg-accent-600 disabled:opacity-60 active:scale-95"
            >
              {busy ? '…' : language === 'hi' ? 'चालू' : 'Enable'}
            </button>
            <button
              onClick={dismiss}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/40 dark:hover:bg-gray-800/40"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
