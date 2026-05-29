const express = require('express');
const { getDb } = require('../db/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Vendor deeplink builders. Affiliate/sub_id is appended via env so it's
// easy to plug in actual affiliate tokens later without code changes.
const VENDORS = {
  blinkit: {
    label: 'Blinkit',
    color: '#F8CB46',
    build: (query) => `https://blinkit.com/s/?q=${encodeURIComponent(query)}`,
    appScheme: (query) => `blinkit://search?q=${encodeURIComponent(query)}`,
  },
  zepto: {
    label: 'Zepto',
    color: '#7C3EFF',
    build: (query) => `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`,
    appScheme: (query) => `zepto://search?q=${encodeURIComponent(query)}`,
  },
  bigbasket: {
    label: 'BigBasket',
    color: '#84BE4F',
    build: (query) => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`,
    appScheme: null,
  },
  swiggyinstamart: {
    label: 'Instamart',
    color: '#FC8019',
    build: (query) => `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`,
    appScheme: null,
  },
  amazonfresh: {
    label: 'Amazon Fresh',
    color: '#FF9900',
    build: (query) => `https://www.amazon.in/s?k=${encodeURIComponent(query)}&i=nowstore`,
    appScheme: null,
  },
};

const buildVendorUrl = (vendor, query) => {
  const v = VENDORS[vendor];
  if (!v) return null;
  let url = v.build(query);
  const tag = process.env[`AFFILIATE_TAG_${vendor.toUpperCase()}`];
  if (tag) {
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}utm_source=kharcha&utm_medium=affiliate&utm_campaign=${encodeURIComponent(tag)}`;
  } else {
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}utm_source=kharcha`;
  }
  return url;
};

router.get('/vendors', (req, res) => {
  res.json(
    Object.entries(VENDORS).map(([key, v]) => ({
      key,
      label: v.label,
      color: v.color,
    }))
  );
});

// Returns a vendor URL for a product. Logs the intent for analytics.
router.post('/redirect', auth, (req, res) => {
  const { vendor, query } = req.body || {};
  if (!vendor || !query) return res.status(400).json({ message: 'vendor and query required' });
  const url = buildVendorUrl(vendor, query);
  if (!url) return res.status(400).json({ message: 'unknown vendor' });

  try {
    const db = getDb();
    db.prepare(
      `INSERT INTO affiliate_clicks (user_id, vendor, product_query, url) VALUES (?, ?, ?, ?)`
    ).run(req.user.id, vendor, query, url);
  } catch (err) {
    console.warn('affiliate log failed:', err.message);
  }

  res.json({ url });
});

module.exports = router;
