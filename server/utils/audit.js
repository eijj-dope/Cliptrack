// Writes one line to the audit log. Example:
//   await logAction('Migs', 'Migs marked Appointment #12 as completed');
const db = require('../db');
async function logAction(actor, text) {
  await db.query('INSERT INTO audit_log (actor, action_text) VALUES (?, ?)', [actor, text]);
}
module.exports = { logAction };
