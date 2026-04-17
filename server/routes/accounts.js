const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const accounts = db.prepare(
    'SELECT id, type, account_number, balance FROM accounts WHERE user_id = ? ORDER BY id'
  ).all(req.user.userId);
  res.json(accounts);
});

router.get('/:id/transactions', auth, (req, res) => {
  const account = db.prepare('SELECT id FROM accounts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.userId);
  if (!account) return res.status(404).json({ error: 'Account not found' });

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const total = db.prepare('SELECT COUNT(*) as cnt FROM transactions WHERE account_id = ?')
    .get(req.params.id).cnt;

  const rows = db.prepare(
    'SELECT * FROM transactions WHERE account_id = ? ORDER BY txn_date DESC, id DESC LIMIT ? OFFSET ?'
  ).all(req.params.id, limit, offset);

  res.json({ total, page, totalPages: Math.ceil(total / limit), transactions: rows });
});

module.exports = router;
