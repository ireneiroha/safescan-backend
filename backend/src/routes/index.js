const express = require('express');
const router = express.Router();

router.use('/health', require('./health.routes'));

// MVP endpoints
router.use('/scan', require('./scan.routes'));

// Optional (post-MVP / future)
router.use('/auth', require('./auth.routes'));
router.use('/user', require('./user.routes'));

module.exports = router;
