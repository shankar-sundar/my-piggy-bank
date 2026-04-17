const router = require('express').Router();
const { accounts, transactions } = require('../store');
const auth = require('../middleware/auth');

const PAGE_SIZE = 20;

router.get('/', auth, (req, res) => {
  const userAccounts = accounts.filter(a => a.user_id === req.user.userId);
  res.json(userAccounts);
});

router.get('/:id/transactions', auth, (req, res) => {
  const accountId = parseInt(req.params.id);
  const account = accounts.find(a => a.id === accountId && a.user_id === req.user.userId);
  if (!account) return res.status(404).json({ error: 'Account not found' });

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const accTxns = transactions
    .filter(t => t.account_id === accountId)
    .sort((a, b) => b.txn_date.localeCompare(a.txn_date) || b.id - a.id);

  const total = accTxns.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rows = accTxns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  res.json({ total, page, totalPages, transactions: rows });
});

module.exports = router;
