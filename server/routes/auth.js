// Module 1: login, logout, who am I.
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { logAction } = require('../utils/audit');

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const [rows] = await db.query(
      'SELECT id, username, password_hash, role, full_name, staff_id FROM users WHERE username = ?',
      [String(username || '').toLowerCase()]
    );
    const u = rows[0];
    if (!u || !(await bcrypt.compare(String(password || ''), u.password_hash))) {
      return res.status(401).json({ error: 'Wrong username or password.' });
    }
    req.session.user = { id: u.id, username: u.username, role: u.role, name: u.full_name, staffId: u.staff_id };
    await logAction(u.full_name, u.full_name + ' logged in');
    res.json(req.session.user);
  } catch (e) { next(e); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) await logAction(user.name, user.name + ' logged out');
    req.session.destroy(() => res.json({ ok: true }));
  } catch (e) { next(e); }
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in.' });
  res.json(req.session.user);
});

module.exports = router;
