const express = require('express');
const { pool } = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

const VENDORS = {
  blinkit: {
    label: 'Blinkit',
    color: '#F8CB46',
    build: (query) => `https://blinkit.com/s/?q=${encodeURIComponent(query)}`,
  },
  zepto: {
    label: 'Zepto',
    color: '#7C3EFF',
    build: (query) => `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`,
  },
  bigbasket: {
    label: 'BigBasket',
    color: '#84BE4F',
    build: (query) => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`,
  },
  swiggyinstamart: {
    label: 'Instamart',
    color: '#FC8019',
    build: (query) => `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`,
  },
  amazonfresh: {
    label: 'Amazon Fresh',
    color: '#FF9900',
    build: (query) => `https://www.amazon.in/s?k=${encodeURIComponent(query)}&i=nowstore`,
  },
};

const buildVendorUrl = (vendor, query) => {
  const v = VENDORS[vendor];
  if (!v) return null;
  let url = v.build(query);
  const tag = process.env[`AFFILIATE_TAG_${vendor.toUpperCase()}`];
  const sep = url.includes('?') ? '&' : '?';
  if (tag) {
    url += `${sep}utm_source=kharcha&utm_medium=affiliate&utm_campaign=${encodeURIComponent(tag)}`;
  } else {
    url += `${sep}utm_source=kharcha`;
  }
  return url;
};

router.get('/vendors', (req, res) => {
  res.json(Object.entries(VENDORS).map(([key, v]) => ({ key, label: v.label, color: v.color })));
});

router.post('/redirect', auth, async (req, res) => {
  const { vendor, query } = req.body || {};
  if (!vendor || !query) return res.status(400).json({ message: 'vendor and query required' });
  const url = buildVendorUrl(vendor, query);
  if (!url) return res.status(400).json({ message: 'unknown vendor' });

  try {
    await pool.query(
      `INSERT INTO affiliate_clicks (user_id, vendor, product_query, url) VALUES ($1, $2, $3, $4)`,
      [req.user.id, vendor, query, url]
    );
  } catch (err) {
    console.warn('affiliate log failed:', err.message);
  }

  res.json({ url });
});

module.exports = router;
