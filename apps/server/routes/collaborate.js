const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/share/:listId', auth, async (req, res) => {
  const { rows: [list] } = await pool.query(
    'SELECT * FROM grocery_lists WHERE id = $1 AND user_id = $2',
    [req.params.listId, req.user.id]
  );
  if (!list) return res.status(404).json({ message: 'List not found' });

  let shareCode = list.share_code;
  if (!shareCode) {
    shareCode = uuidv4().slice(0, 8).toUpperCase();
    await pool.query('UPDATE grocery_lists SET share_code = $1 WHERE id = $2', [shareCode, list.id]);
  }

  const shareUrl = `${req.protocol}://${req.get('host')}/join/${shareCode}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`Join my Omni grocery list: ${shareUrl}`)}`;
  res.json({ share_code: shareCode, share_url: shareUrl, whatsapp_url: waUrl });
});

router.post('/join', auth, async (req, res) => {
  const { share_code } = req.body;
  if (!share_code) return res.status(400).json({ message: 'share_code required' });

  const { rows: [list] } = await pool.query(
    'SELECT * FROM grocery_lists WHERE share_code = $1',
    [share_code.toUpperCase()]
  );
  if (!list) return res.status(404).json({ message: 'Invalid share code' });

  if (list.user_id === req.user.id) return res.json({ list, message: 'You own this list' });

  await pool.query(
    `INSERT INTO list_collaborators (list_id, user_id) VALUES ($1, $2)
     ON CONFLICT (list_id, user_id) DO NOTHING`,
    [list.id, req.user.id]
  );
  res.json({ list, message: 'Joined list successfully' });
});

router.delete('/leave/:listId', auth, async (req, res) => {
  await pool.query(
    'DELETE FROM list_collaborators WHERE list_id = $1 AND user_id = $2',
    [req.params.listId, req.user.id]
  );
  res.json({ message: 'Left list' });
});

module.exports = router;
