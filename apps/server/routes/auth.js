const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// In-memory OTP store (Map is fine for single instance)
const otpStore = new Map();

// ---------- SMS delivery via MSG91 Flow API ----------
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_OTP_VAR = process.env.MSG91_OTP_VAR || 'OTP'; // must match the variable name in your DLT template
const SMS_COUNTRY_CODE = process.env.SMS_COUNTRY_CODE || '91';

async function sendOtpSms(phone, otp) {
  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    const err = new Error('SMS service is not configured. Please try again later.');
    err.status = 503;
    throw err;
  }

  const recipient = { mobiles: `${SMS_COUNTRY_CODE}${phone}` };
  recipient[MSG91_OTP_VAR] = otp;

  let resp, data;
  try {
    resp = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        authkey: MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        template_id: MSG91_TEMPLATE_ID,
        short_url: '0',
        recipients: [recipient],
      }),
    });
    data = await resp.json().catch(() => ({}));
  } catch (e) {
    const err = new Error('Could not reach the SMS service. Please try again.');
    err.status = 502;
    throw err;
  }

  // MSG91 replies { type: 'success' | 'error', message }
  if (!resp.ok || data.type === 'error') {
    console.error('MSG91 send failed:', resp.status, data);
    const err = new Error('Failed to send OTP. Please try again.');
    err.status = 502;
    throw err;
  }
  return data;
}

router.post('/send-otp', async (req, res, next) => {
  const { phone } = req.body;
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'Valid 10-digit Indian mobile number required' });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  // Dev/demo mode: skip real SMS and return the code so it can be shown on screen.
  if (process.env.DEV_OTP_VISIBLE === 'true') {
    return res.json({ message: 'OTP sent successfully', otp });
  }

  // Production: deliver the code via SMS.
  try {
    await sendOtpSms(phone, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    otpStore.delete(phone); // don't leave a code that was never delivered
    next(err);
  }
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP required' });
  }

  const stored = otpStore.get(phone);
  if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  otpStore.delete(phone);

  // Upsert user
  let { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
  let user = rows[0];

  if (!user) {
    const ins = await pool.query(
      'INSERT INTO users (phone) VALUES ($1) RETURNING *',
      [phone]
    );
    user = ins.rows[0];
    // Create default grocery list
    await pool.query(
      'INSERT INTO grocery_lists (user_id, name) VALUES ($1, $2)',
      [user.id, 'Weekly Essentials']
    );
  }

  const token = uuidv4();
  const expiryDays = parseInt(process.env.SESSION_EXPIRY_DAYS || '30');
  await pool.query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${expiryDays} days')`,
    [token, user.id]
  );

  res.json({
    token,
    user: {
      id: user.id, name: user.name, phone: user.phone,
      language: user.language, dark_mode: user.dark_mode,
      dietary_pref: user.dietary_pref, family_size: user.family_size,
      monthly_budget: parseFloat(user.monthly_budget),
    },
  });
});

router.post('/logout', auth, async (req, res) => {
  const token = req.headers.authorization.slice(7);
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  res.json({ message: 'Logged out' });
});

router.delete('/account', auth, async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('UPDATE grocery_items SET added_by = NULL WHERE added_by = $1', [req.user.id]);
    await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    await client.query('COMMIT');
    res.json({ message: 'Account and associated data deleted' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

router.put('/profile', auth, async (req, res) => {
  const { name, language, dark_mode, dietary_pref, family_size, monthly_budget } = req.body;
  await pool.query(
    `UPDATE users SET
      name = COALESCE($1, name),
      language = COALESCE($2, language),
      dark_mode = COALESCE($3, dark_mode),
      dietary_pref = COALESCE($4, dietary_pref),
      family_size = COALESCE($5, family_size),
      monthly_budget = COALESCE($6, monthly_budget)
     WHERE id = $7`,
    [name, language, dark_mode, dietary_pref, family_size, monthly_budget, req.user.id]
  );
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  res.json({ user: rows[0] });
});

module.exports = router;
