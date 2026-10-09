// Use these on any route that needs a logged-in user.
//   router.get('/x', requireLogin, handler)       any staff or admin
//   router.post('/y', requireAdmin, handler)      admin only
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please log in first.' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please log in first.' });
  if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  next();
}
module.exports = { requireLogin, requireAdmin };
