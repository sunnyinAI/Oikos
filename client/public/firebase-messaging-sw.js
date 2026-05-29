// Firebase Messaging Service Worker for Omni (Web Push / FCM).
// IMPORTANT: This file is fetched directly by the browser. It cannot import
// from your app build. The config below is intentionally fetched at runtime
// from your own API so you don't have to bake secrets into a static file.

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

async function init() {
  try {
    const res = await fetch('/api/push/config');
    const cfg = await res.json();
    if (!cfg.configured) return;
    firebase.initializeApp(cfg.web);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const { notification, data } = payload || {};
      const title = notification?.title || data?.title || 'Omni';
      const options = {
        body: notification?.body || data?.body || '',
        icon: '/omni-icon-192.png',
        badge: '/omni-icon-192.png',
        data: data || {},
      };
      self.registration.showNotification(title, options);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('FCM SW init failed:', err);
  }
}
init();

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) {
          w.navigate?.(target);
          return w.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
