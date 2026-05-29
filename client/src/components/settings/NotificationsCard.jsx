import { useEffect, useState } from 'react';
import { Bell, BellOff, Send } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { enablePush, disablePush, isPushAvailable } from '../../lib/push';
import { getPushAdminStatus, sendTestPush } from '../../lib/api';
import { useUIStore } from '../../store/useUIStore';

export default function NotificationsCard() {
  const addToast = useUIStore((s) => s.addToast);
  const [status, setStatus] = useState({ available: false, configured: false, adminReady: false, granted: false, hasToken: false });
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const perm = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    const hasToken = Boolean(localStorage.getItem('omni_push_token'));
    const avail = await isPushAvailable();
    let admin = { ready: false, error: null };
    try { admin = await getPushAdminStatus(); } catch { /* noop */ }
    setStatus({
      available: avail.available,
      configured: avail.available || avail.reason !== 'unconfigured',
      adminReady: admin.ready,
      adminError: admin.error,
      granted: perm === 'granted',
      hasToken,
    });
  };

  useEffect(() => { refresh(); }, []);

  const onEnable = async () => {
    setBusy(true);
    try {
      await enablePush();
      addToast('Notifications enabled ✓', 'success');
      await refresh();
    } catch (err) {
      addToast(err.message || 'Could not enable', 'error');
    } finally { setBusy(false); }
  };

  const onDisable = async () => {
    setBusy(true);
    try {
      await disablePush();
      addToast('Notifications turned off', 'info');
      await refresh();
    } finally { setBusy(false); }
  };

  const onTest = async () => {
    setBusy(true);
    try {
      const r = await sendTestPush();
      if (r.sent > 0) addToast(`Test push sent (${r.sent} device${r.sent !== 1 ? 's' : ''})`, 'success');
      else addToast('No devices received it. Try enabling again.', 'error');
    } catch (err) {
      addToast(err.message || 'Test failed', 'error');
    } finally { setBusy(false); }
  };

  const enabled = status.granted && status.hasToken;

  return (
    <Card className="px-5 py-5">
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${enabled ? 'bg-money-50 text-money-700 dark:bg-money-900/20 dark:text-money-300' : 'bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300'}`}>
          {enabled ? <Bell size={20} /> : <BellOff size={20} />}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {enabled
              ? 'Get price-drop, expiry & bill alerts'
              : 'Turn on for price-drop, expiry & bill alerts'}
          </p>
        </div>
      </div>

      {!status.available && (
        <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Push isn't supported in this browser, or the server config is missing.
        </p>
      )}

      {status.available && !enabled && (
        <Button onClick={onEnable} loading={busy} className="w-full">
          <Bell size={16} /> Enable notifications
        </Button>
      )}

      {status.available && enabled && (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onDisable} loading={busy} className="flex-1">
            <BellOff size={16} /> Turn off
          </Button>
          <Button onClick={onTest} loading={busy} disabled={!status.adminReady} className="flex-1">
            <Send size={16} /> Send test
          </Button>
        </div>
      )}

      {status.available && enabled && !status.adminReady && (
        <p className="mt-3 rounded-xl bg-accent-50 px-3 py-2 text-xs text-accent-800 dark:bg-accent-900/20 dark:text-accent-200">
          To actually <strong>send</strong> a push, add your Firebase service-account JSON server-side. See README → Push setup.
        </p>
      )}
    </Card>
  );
}
