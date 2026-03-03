const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');
const rateLimit = require('express-rate-limit');

router.use('/health', require('./health.routes'));

// Public lookup endpoint
router.use('/lookup', require('./lookup.routes'));

// Privacy policy endpoint (public)
router.use('/privacy', require('./privacy.routes'));

// Protected MVP endpoints
router.use('/scan', requireAuth, require('./scan.routes'));

// Protected scan history endpoint
router.use('/scans', requireAuth, require('./scans.routes'));

// Protected Dataset endpoints
router.use('/dataset', requireAuth, require('./dataset.routes'));

// Auth endpoints (public)
router.use('/auth', require('./auth.routes'));

// Protected user endpoints
router.use('/user', requireAuth, require('./user.routes'));

// Protected AI Action endpoint with rate limiting (20 req / 5 min per IP)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  trustProxy: 1
});

// AI routes: /api/aiAction
// - /health: public (no auth, no rate limiting)
// - /explain: protected (requires JWT + rate limiting, handled in route)
router.use('/aiAction', aiLimiter, require('./ai.routes'));

module.exports = router;
