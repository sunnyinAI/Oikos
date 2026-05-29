const express = require('express');
const { getDb } = require('../db/database');
const { auth } = require('../middleware/auth');
const { sendToUser, isAdminReady, getInitError } = require('../services/pushService');

const router = express.Router();

// Register a Web Push (FCM) token for the current user.
router.post('/register', auth, (req, res) => {
  const { token, platform = 'web', userAgent = null } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'token required' });
  }
  const db = getDb();
  db.prepare(
    `INSERT OR IGNORE INTO push_tokens (user_id, token, platform, user_agent)
     VALUES (?, ?, ?, ?)`
  ).run(req.user.id, token, platform, userAgent);
  res.json({ ok: true });
});

router.post('/unregister', auth, (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ message: 'token required' });
  const db = getDb();
  db.prepare(`DELETE FROM push_tokens WHERE user_id = ? AND token = ?`).run(req.user.id, token);
  res.json({ ok: true });
});

// Returns the FCM web config so the frontend doesn't need to bake it.
// You must set these env vars from your Firebase project's web app config.
router.get('/config', (req, res) => {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_VAPID_KEY',
  ];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    return res.json({ configured: false, missing });
  }
  res.json({
    configured: true,
    web: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: process.env.FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    vapidKey: process.env.FIREBASE_VAPID_KEY,
  });
});

// Whether the server can actually SEND pushes (needs service-account JSON).
router.get('/admin-status', auth, (req, res) => {
  const ready = isAdminReady();
  res.json({ ready, error: ready ? null : getInitError() });
});

router.post('/test', auth, async (req, res) => {
  try {
    const result = await sendToUser(req.user.id, {
      title: 'Kharcha 👋',
      body: `Hi ${req.user.name || 'there'}! Push notifications are live.`,
      url: '/',
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
