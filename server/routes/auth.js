const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../store');

const SECRET = process.env.JWT_SECRET || 'piggy-secret-key';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, username: user.username }, SECRET, { expiresIn: '8h' });
  res.json({ token, username: user.username });
});

module.exports = router;
