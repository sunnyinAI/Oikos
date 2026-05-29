const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/share/:listId', auth, (req, res) => {
  const db = getDb();
  const list = db.prepare('SELECT * FROM grocery_lists WHERE id = ? AND user_id = ?').get(req.params.listId, req.user.id);
  if (!list) return res.status(404).json({ message: 'List not found' });

  let shareCode = list.share_code;
  if (!shareCode) {
    shareCode = uuidv4().slice(0, 8).toUpperCase();
    db.prepare('UPDATE grocery_lists SET share_code = ? WHERE id = ?').run(shareCode, list.id);
  }

  const shareUrl = `${req.protocol}://${req.get('host')}/join/${shareCode}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`Join my Omni grocery list: ${shareUrl}`)}`;

  res.json({ share_code: shareCode, share_url: shareUrl, whatsapp_url: waUrl });
});

router.post('/join', auth, (req, res) => {
  const { share_code } = req.body;
  if (!share_code) return res.status(400).json({ message: 'share_code required' });

  const db = getDb();
  const list = db.prepare('SELECT * FROM grocery_lists WHERE share_code = ?').get(share_code.toUpperCase());
  if (!list) return res.status(404).json({ message: 'Invalid share code' });

  // Don't add owner again
  if (list.user_id === req.user.id) {
    return res.json({ list, message: 'You own this list' });
  }

  const existing = db.prepare('SELECT * FROM list_collaborators WHERE list_id = ? AND user_id = ?').get(list.id, req.user.id);
  if (!existing) {
    db.prepare('INSERT INTO list_collaborators (list_id, user_id) VALUES (?, ?)').run(list.id, req.user.id);
  }

  res.json({ list, message: 'Joined list successfully' });
});

router.delete('/leave/:listId', auth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM list_collaborators WHERE list_id = ? AND user_id = ?').run(req.params.listId, req.user.id);
  res.json({ message: 'Left list' });
});

module.exports = router;
