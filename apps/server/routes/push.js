const express = require('express');
const { pool } = require('../db/pool');
const { auth } = require('../middleware/auth');
const { sendToUser, isAdminReady, getInitError } = require('../services/pushService');

const router = express.Router();

router.post('/register', auth, async (req, res) => {
  const { token, platform = 'web', userAgent = null } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'token required' });
  }
  await pool.query(
    `INSERT INTO push_tokens (user_id, token, platform, user_agent)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, token) DO NOTHING`,
    [req.user.id, token, platform, userAgent]
  );
  res.json({ ok: true });
});

router.post('/unregister', auth, async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ message: 'token required' });
  await pool.query(`DELETE FROM push_tokens WHERE user_id = $1 AND token = $2`, [req.user.id, token]);
  res.json({ ok: true });
});

router.get('/config', (req, res) => {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_VAPID_KEY',
  ];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) return res.json({ configured: false, missing });
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

router.get('/admin-status', auth, (req, res) => {
  const ready = isAdminReady();
  res.json({ ready, error: ready ? null : getInitError() });
});

router.post('/test', auth, async (req, res) => {
  try {
    const result = await sendToUser(req.user.id, {
      title: 'Oikos 👋',
      body: `Hi ${req.user.name || 'there'}! Push notifications are live.`,
      url: '/',
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
