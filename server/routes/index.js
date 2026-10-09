// Central place that mounts every route file.
// To add a new feature: create server/routes/yourthing.js, then add one line below.
const router = require('express').Router();

router.get('/health', (req, res) => res.json({ ok: true, app: 'ClipTrack' }));

router.use('/auth', require('./auth'));
router.use('/services', require('./services'));
router.use('/appointments', require('./appointments'));
router.use('/staff', require('./staff'));
router.use('/clients', require('./clients'));
// router.use('/billing', require('./billing'));     // Module 8 (Sprint 3)
// router.use('/feedback', require('./feedback'));   // Module 9 (Sprint 3)
// router.use('/analytics', require('./analytics')); // Module 10 (Sprint 5)

module.exports = router;
