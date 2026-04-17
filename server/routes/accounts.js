const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

const PAGE_SIZE = 20;

router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('id, type, account_number, balance')
    .eq('user_id', req.user.userId)
    .order('id');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id/transactions', auth, async (req, res) => {
  const accountId = parseInt(req.params.id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', req.user.userId)
    .single();

  if (!account) return res.status(404).json({ error: 'Account not found' });

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('account_id', accountId)
    .order('txn_date', { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    total: count,
    page,
    totalPages: Math.ceil(count / PAGE_SIZE),
    transactions: data,
  });
});

module.exports = router;
