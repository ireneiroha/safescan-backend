const router = require('express').Router();
const { getScanHistory } = require('../controllers/scanHistory.controller');

// Get scan history for logged-in user
router.get('/', getScanHistory);

module.exports = router;
