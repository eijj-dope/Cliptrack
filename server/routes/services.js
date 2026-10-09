// Module 5: services and pricing.
// GET is public (the booking form needs it). Changes are admin only.
const router = require('express').Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, name, price, duration_min FROM services WHERE active = 1 ORDER BY id');
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, price, durationMin } = req.body || {};
    if (!name || !(Number(price) >= 0) || !(Number(durationMin) > 0)) {
      return res.status(400).json({ error: 'Name, price, and duration are required.' });
    }
    const [r] = await db.query('INSERT INTO services (name, price, duration_min) VALUES (?, ?, ?)', [name, price, durationMin]);
    await logAction(req.session.user.name, req.session.user.name + ' added service ' + name);
    res.status(201).json({ id: r.insertId });
  } catch (e) { next(e); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, price, durationMin } = req.body || {};
    await db.query('UPDATE services SET name = ?, price = ?, duration_min = ? WHERE id = ?', [name, price, durationMin, req.params.id]);
    await logAction(req.session.user.name, req.session.user.name + ' edited service ' + name);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// "Delete" only hides the service so old appointments keep their record.
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('UPDATE services SET active = 0 WHERE id = ?', [req.params.id]);
    await logAction(req.session.user.name, req.session.user.name + ' removed service #' + req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
