import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const { language, pwaPromptDismissedAt, dismissPwaPrompt } = useUIStore();

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const recentlyDismissed =
      pwaPromptDismissedAt && Date.now() - pwaPromptDismissedAt < SEVEN_DAYS_MS;
    if (recentlyDismissed) return;

    const onBefore = (e) => {
      e.preventDefault();
      setDeferred(e);
      setTimeout(() => setVisible(true), 1200);
    };
    window.addEventListener('beforeinstallprompt', onBefore);

    const onInstalled = () => setVisible(false);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [pwaPromptDismissedAt]);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
    if (outcome === 'dismissed') dismissPwaPrompt();
  };

  const close = () => {
    setVisible(false);
    dismissPwaPrompt();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="fixed bottom-20 left-1/2 z-40 w-full max-w-sm -translate-x-1/2 px-4"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-3 shadow-xl dark:border-brand-900/40 dark:bg-gray-800">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Download size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {language === 'hi' ? 'Oikos इंस्टॉल करें' : 'Install Oikos'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'होम स्क्रीन पर जोड़ें — तेज़ खुलेगा'
                  : 'Add to home screen — opens instantly'}
              </p>
            </div>
            <button
              onClick={install}
              className="rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-soft hover:bg-brand-600 active:scale-95"
            >
              {language === 'hi' ? 'जोड़ें' : 'Add'}
            </button>
            <button
              onClick={close}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
