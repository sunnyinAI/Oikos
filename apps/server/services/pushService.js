const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { pool } = require('../db/pool');

let initialized = false;
let initError = null;

const loadServiceAccount = () => {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline?.trim()) {
    try {
      return JSON.parse(inline);
    } catch (err) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
  }
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
    || path.join(__dirname, '..', '..', '..', 'firebase-service-account.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
};

const init = () => {
  if (initialized) return true;
  if (initError) return false;
  try {
    const creds = loadServiceAccount();
    if (!creds) {
      initError = new Error('Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or place firebase-service-account.json at repo root.');
      return false;
    }
    admin.initializeApp({
      credential: admin.credential.cert(creds),
      projectId: creds.project_id || process.env.FIREBASE_PROJECT_ID,
    });
    initialized = true;
    return true;
  } catch (err) {
    initError = err;
    return false;
  }
};

const isAdminReady = () => {
  init();
  return initialized;
};

const getInitError = () => initError?.message || null;

const sendToUser = async (userId, { title, body, url, data = {} }) => {
  if (!init()) {
    throw new Error(initError?.message || 'Push admin not initialized');
  }
  const { rows } = await pool.query('SELECT token FROM push_tokens WHERE user_id = $1', [userId]);
  const tokens = rows.map((r) => r.token);
  if (tokens.length === 0) return { sent: 0, failed: 0, pruned: 0 };

  const message = {
    notification: { title, body },
    data: {
      url: url || '/',
      ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    },
    webpush: {
      fcmOptions: { link: url || '/' },
      notification: { icon: '/kharcha-icon-192.png', badge: '/kharcha-icon-192.png' },
    },
  };

  const res = await admin.messaging().sendEachForMulticast({ tokens, ...message });

  let pruned = 0;
  for (let i = 0; i < res.responses.length; i++) {
    const r = res.responses[i];
    if (!r.success) {
      const code = r.error?.errorInfo?.code || r.error?.code || '';
      if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
        await pool.query('DELETE FROM push_tokens WHERE token = $1', [tokens[i]]);
        pruned += 1;
      }
    }
  }

  return { sent: res.successCount, failed: res.failureCount, pruned };
};

module.exports = { isAdminReady, getInitError, sendToUser };
