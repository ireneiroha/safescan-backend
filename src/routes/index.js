const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

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

module.exports = router;
