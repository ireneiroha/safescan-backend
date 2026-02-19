const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

router.use('/health', require('./health.routes'));

// Protected MVP endpoints
router.use('/scan', requireAuth, require('./scan.routes'));

// Protected Dataset endpoints
router.use('/dataset', requireAuth, require('./dataset.routes'));

// Auth endpoints (public)
router.use('/auth', require('./auth.routes'));

// Protected user endpoints
router.use('/user', requireAuth, require('./user.routes'));

module.exports = router;
