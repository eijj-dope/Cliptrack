# ClipTrack

Web-Based Appointment and Client Management System with Customer Analytics for ClipTop Barbers.

## Current status
- `public/` is the working front end (landing page, public booking form, staff and admin dashboard).
  It currently runs in demo mode: data is saved in the browser (localStorage).
- `server/` and `database/` are the backend (Node.js, Express, MySQL). The routes for login, services,
  staff, clients, and appointments (with double-booking check and client matching) are written and ready to be connected.

## Project map: where to add things

    cliptrack/
    ├── package.json            dependencies and run commands
    ├── .env.example            copy to .env and fill in your database login
    ├── database/
    │   └── schema.sql          all tables (run once)
    ├── server/
    │   ├── app.js              starts the server
    │   ├── db.js               database connection
    │   ├── routes/
    │   │   ├── index.js        add a new route file here with one line
    │   │   ├── auth.js         login, logout (Module 1)
    │   │   ├── services.js     services and pricing (Module 5)
    │   │   ├── staff.js        staff and hours (Module 4)
    │   │   ├── clients.js      client list (Module 6)
    │   │   └── appointments.js booking and management (Modules 2 and 3)
    │   ├── middleware/auth.js  requireLogin, requireAdmin
    │   ├── utils/              audit log, phone number helper
    │   └── scripts/seed.js     demo data
    └── public/
        ├── index.html
        ├── css/style.css
        └── js/
            ├── app.js          current front-end logic (demo mode)
            └── api.js          helper for calling the backend

### Add a new route (example: billing)
1. Create `server/routes/billing.js` (copy the shape of `services.js`).
2. In `server/routes/index.js`, uncomment or add: `router.use('/billing', require('./billing'));`
3. Call it from the front end: `await api.post('/billing', {...})`.

## Run the front end only (demo mode)
Open `public/index.html` in Chrome or Edge.

## Run the full system (with backend)
1. Install Node.js (LTS) and MySQL (XAMPP is fine, start Apache and MySQL).
2. In this folder, run: `npm install`
3. Copy `.env.example` to `.env` and set `DB_PASSWORD` if your MySQL has one.
4. Create the tables: in phpMyAdmin choose Import and select `database/schema.sql`.
5. Add demo data: `npm run seed`
6. Start the server: `npm start` (or `npm run dev` to restart automatically on changes)
7. Open http://localhost:3000

Quick check that the server works: open http://localhost:3000/api/health. It should show `{"ok":true,"app":"ClipTrack"}`.

## Demo accounts
- Admin: admin / admin123
- Staff: migs / staff123

## Next steps
- Connect `public/js/app.js` to the API (replace the localStorage data with `api` calls).
- Sprint 3: billing, feedback. Sprint 4: SMS and email. Sprint 5: analytics.
