// Module 4: staff list. TODO: add PUT /:id so the admin can edit hours and services.
const router = require('express').Router();
const db = require('../db');

// Public: the booking form shows barber names and which services each one performs.
router.get('/', async (req, res, next) => {
  try {
    const [staff] = await db.query('SELECT id, name, work_start, work_end, work_days FROM staff WHERE active = 1 ORDER BY id');
    const [links] = await db.query('SELECT staff_id, service_id FROM staff_services');
    res.json(staff.map(s => ({
      ...s,
      work_days: s.work_days.split(',').filter(Boolean).map(Number),
      service_ids: links.filter(l => l.staff_id === s.id).map(l => l.service_id)
    })));
  } catch (e) { next(e); }
});

module.exports = router;
