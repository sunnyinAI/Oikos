// Firebase Cloud Messaging (Web) integration for Oikos.
// Lazy-loads firebase so the SDK is only paid for if the user opts in.

import { getPushConfig, registerPushToken, unregisterPushToken } from './api';

let initializedAppRef = null;
let messagingRef = null;
let cachedConfig = null;

const supportsPush = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  typeof Notification !== 'undefined';

async function ensureSw() {
  // Register a dedicated SW for firebase-messaging
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;
  return reg;
}

async function loadFirebase() {
  if (initializedAppRef && messagingRef) {
    return { app: initializedAppRef, messaging: messagingRef };
  }
  cachedConfig = cachedConfig || (await getPushConfig());
  if (!cachedConfig?.configured) {
    throw new Error('Push not configured on server');
  }
  const [{ initializeApp, getApps }, { getMessaging, isSupported }] = await Promise.all([
    import('firebase/app'),
    import('firebase/messaging'),
  ]);
  if (!(await isSupported())) {
    throw new Error('Push not supported in this browser');
  }
  const app = getApps().length ? getApps()[0] : initializeApp(cachedConfig.web);
  const messaging = getMessaging(app);
  initializedAppRef = app;
  messagingRef = messaging;
  return { app, messaging };
}

export async function isPushAvailable() {
  if (!supportsPush()) return { available: false, reason: 'unsupported' };
  try {
    const cfg = await getPushConfig();
    if (!cfg.configured) return { available: false, reason: 'unconfigured', missing: cfg.missing };
    return { available: true };
  } catch {
    return { available: false, reason: 'server-error' };
  }
}

export async function enablePush() {
  if (!supportsPush()) throw new Error('Push not supported');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }
  await ensureSw();
  const { messaging } = await loadFirebase();
  const { getToken } = await import('firebase/messaging');
  const token = await getToken(messaging, {
    vapidKey: cachedConfig.vapidKey,
    serviceWorkerRegistration: await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js'),
  });
  if (!token) throw new Error('Could not obtain push token');
  await registerPushToken(token, 'web');
  localStorage.setItem('oikos_push_token', token);
  return token;
}

export async function disablePush() {
  const token = localStorage.getItem('oikos_push_token');
  if (token) {
    try { await unregisterPushToken(token); } catch { /* noop */ }
    localStorage.removeItem('oikos_push_token');
  }
}

export async function onForegroundMessage(handler) {
  try {
    const { messaging } = await loadFirebase();
    const { onMessage } = await import('firebase/messaging');
    return onMessage(messaging, handler);
  } catch {
    return () => {};
  }
}
