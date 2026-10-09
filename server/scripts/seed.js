// Fills the database with demo data.  Run once after creating the tables:  npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');

(async () => {
  const [[{ n }]] = await db.query('SELECT COUNT(*) AS n FROM services');
  if (n > 0) { console.log('Database already has data. Nothing was changed.'); process.exit(0); }

  const services = [['Classic haircut', 150, 30], ['Fade haircut', 180, 45], ['Beard trim', 100, 30], ['Haircut and beard', 250, 60], ['Hair color', 600, 90]];
  for (const s of services) await db.query('INSERT INTO services (name, price, duration_min) VALUES (?, ?, ?)', s);

  await db.query("INSERT INTO staff (name, work_start, work_end, work_days) VALUES ('Ramon','09:00','18:00','1,2,3,4,5,6'), ('Migs','10:00','19:00','2,3,4,5,6'), ('Jun','09:00','17:00','1,2,3,4,5,6')");
  // Ramon (1) does everything, Migs (2) services 1-4, Jun (3) services 1 and 3
  const links = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,1],[2,2],[2,3],[2,4],[3,1],[3,3]];
  for (const l of links) await db.query('INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)', l);

  const users = [['admin', 'admin123', 'admin', 'Ramon (Owner)', 1], ['migs', 'staff123', 'staff', 'Migs', 2], ['jun', 'staff123', 'staff', 'Jun', 3]];
  for (const u of users) await db.query('INSERT INTO users (username, password_hash, role, full_name, staff_id) VALUES (?, ?, ?, ?, ?)', [u[0], await bcrypt.hash(u[1], 10), u[2], u[3], u[4]]);

  console.log('Seed complete. Demo logins: admin / admin123 and migs / staff123');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
