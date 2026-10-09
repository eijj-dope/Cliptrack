// Module 6: clients. TODO: add search and visit history (GET /:id/history).
const router = require('express').Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, async (req, res, next) => {
  try {
    const q = '%' + String(req.query.q || '') + '%';
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.contact,
              COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS visits,
              MAX(CASE WHEN a.status = 'completed' THEN a.appt_date END) AS last_visit
         FROM clients c LEFT JOIN appointments a ON a.client_id = c.id
        WHERE c.name LIKE ? OR c.contact LIKE ?
        GROUP BY c.id ORDER BY last_visit DESC`, [q, q]);
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
