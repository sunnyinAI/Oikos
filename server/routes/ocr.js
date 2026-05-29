const express = require('express');
const { auth } = require('../middleware/auth');
const { extractBill, isOcrConfigured } = require('../services/ocrService');

const router = express.Router();

router.get('/status', auth, (req, res) => {
  res.json({ configured: isOcrConfigured() });
});

router.post('/bill', auth, async (req, res) => {
  try {
    const { image, mimeType } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ message: 'image (base64) required' });
    }

    // Strip data URL prefix if present: "data:image/jpeg;base64,...."
    let base64 = image;
    let mt = mimeType || 'image/jpeg';
    const m = image.match(/^data:([^;]+);base64,(.+)$/);
    if (m) {
      mt = m[1] || mt;
      base64 = m[2];
    }

    // Cap payload at ~6 MB base64 (~4.5 MB raw)
    if (base64.length > 8_000_000) {
      return res.status(413).json({ message: 'Image too large. Please retake or use a smaller photo.' });
    }

    const result = await extractBill({ imageBase64: base64, mimeType: mt });
    res.json(result);
  } catch (err) {
    console.error('OCR error:', err.message);
    res.status(500).json({ message: err.message || 'OCR failed' });
  }
});

module.exports = router;
