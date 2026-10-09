// ClipTrack server entry point.  Start with:  npm start   (or npm run dev while coding)
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// All backend routes live under /api  (see server/routes/)
app.use('/api', routes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// The front end (public/ folder) is served as normal web pages
app.use(express.static(path.join(__dirname, '..', 'public')));

// Last-resort error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('ClipTrack running at http://localhost:' + port));
