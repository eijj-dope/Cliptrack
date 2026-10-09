// Modules 2 and 3: booking and appointment management.
const router = require('express').Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { logAction } = require('../utils/audit');
const { normPhone, validPhone } = require('../utils/phone');

const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };

// Staff and admin: list appointments. Filters: ?q=name&date=2026-10-09&status=pending&staffId=2
router.get('/', requireLogin, async (req, res, next) => {
  try {
    const { q, date, status, staffId } = req.query;
    const where = [], params = [];
    if (q) { where.push('(c.name LIKE ? OR c.contact LIKE ?)'); params.push('%' + q + '%', '%' + q + '%'); }
    if (date) { where.push('a.appt_date = ?'); params.push(date); }
    if (status) { where.push('a.status = ?'); params.push(status); }
    if (staffId) { where.push('a.staff_id = ?'); params.push(staffId); }
    const [rows] = await db.query(
      `SELECT a.id, a.appt_date, a.appt_time, a.status, a.source,
              c.name AS client_name, c.contact, s.name AS service_name, s.price, s.duration_min, st.name AS staff_name
         FROM appointments a
         JOIN clients c ON c.id = a.client_id
         JOIN services s ON s.id = a.service_id
         JOIN staff st ON st.id = a.staff_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY a.appt_date DESC, a.appt_time DESC`, params);
    res.json(rows);
  } catch (e) { next(e); }
});

// Shared by the public form and the walk-in entry. Checks double booking, matches the client, saves.
async function createAppointment({ name, contact, serviceId, staffId, date, time, source, status }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [svc] = await conn.query('SELECT id, duration_min FROM services WHERE id = ? AND active = 1', [serviceId]);
    if (!svc[0]) { await conn.rollback(); return { error: 'That service is not available.', code: 400 }; }
    const dur = svc[0].duration_min, start = toMin(time);

    // Lock this barber's row so two people cannot book the same slot at the same moment.
    const [st] = await conn.query('SELECT id FROM staff WHERE id = ? AND active = 1 FOR UPDATE', [staffId]);
    if (!st[0]) { await conn.rollback(); return { error: 'That barber is not available.', code: 400 }; }

    const [clash] = await conn.query(
      `SELECT a.id FROM appointments a JOIN services s ON s.id = a.service_id
        WHERE a.staff_id = ? AND a.appt_date = ? AND a.status IN ('pending','confirmed','completed')
          AND TIME_TO_SEC(a.appt_time) / 60 < ? AND ? < TIME_TO_SEC(a.appt_time) / 60 + s.duration_min`,
      [staffId, date, start + dur, start]);
    if (clash.length) { await conn.rollback(); return { error: 'That time was just taken. Please pick another time.', code: 409 }; }

    // Match a returning client by phone number, otherwise create a new profile.
    const phone = normPhone(contact);
    let client, returning = false;
    if (phone) {
      const [f] = await conn.query('SELECT id, name FROM clients WHERE contact = ? LIMIT 1', [phone]);
      client = f[0];
    } else {
      const [f] = await conn.query('SELECT id, name FROM clients WHERE LOWER(name) = LOWER(?) LIMIT 1', [name]);
      client = f[0];
    }
    if (client) returning = true;
    else {
      const [r] = await conn.query('INSERT INTO clients (name, contact) VALUES (?, ?)', [name, phone || null]);
      client = { id: r.insertId, name };
    }

    const [ins] = await conn.query(
      'INSERT INTO appointments (client_id, service_id, staff_id, appt_date, appt_time, status, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [client.id, serviceId, staffId, date, time, status, source]);
    await conn.commit();
    return { id: ins.insertId, clientName: client.name, returning };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Public booking form (no login): creates a PENDING online request.
router.post('/public', async (req, res, next) => {
  try {
    const { name, contact, serviceId, staffId, date, time } = req.body || {};
    if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'Enter your full name.' });
    if (!validPhone(contact)) return res.status(400).json({ error: 'Enter a valid mobile number, like 0917 123 4567.' });
    if (!serviceId || !staffId || !date || !time) return res.status(400).json({ error: 'Choose a service, barber, date, and time.' });
    const r = await createAppointment({ name: String(name).trim(), contact, serviceId, staffId, date, time, source: 'online', status: 'pending' });
    if (r.error) return res.status(r.code).json({ error: r.error });
    await logAction('Public booking form', 'New online booking: Appointment #' + r.id + ' for ' + r.clientName + (r.returning ? ' (returning client)' : ' (new client)'));
    res.status(201).json(r);
  } catch (e) { next(e); }
});

// Staff and admin: add a walk-in (confirmed right away).
router.post('/walk-in', requireLogin, async (req, res, next) => {
  try {
    const { name, contact, serviceId, staffId, date, time } = req.body || {};
    if (!name || !serviceId || !staffId || !date || !time) return res.status(400).json({ error: 'Name, service, barber, date, and time are required.' });
    const r = await createAppointment({ name: String(name).trim(), contact, serviceId, staffId, date, time, source: 'walk-in', status: 'confirmed' });
    if (r.error) return res.status(r.code).json({ error: r.error });
    await logAction(req.session.user.name, req.session.user.name + ' added walk-in Appointment #' + r.id + ' for ' + r.clientName);
    res.status(201).json(r);
  } catch (e) { next(e); }
});

// Staff and admin: confirm, complete, cancel, or mark no-show.
router.patch('/:id/status', requireLogin, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (['confirmed', 'completed', 'cancelled', 'no-show'].indexOf(status) < 0) return res.status(400).json({ error: 'Invalid status.' });
    const [r] = await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Appointment not found.' });
    await logAction(req.session.user.name, req.session.user.name + ' marked Appointment #' + req.params.id + ' as ' + status);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// TODO: PATCH /:id/reschedule (re-run the double-booking check, ignoring this appointment itself)

module.exports = router;
