const router = require('express').Router();
const { lookupIngredient } = require('../controllers/lookup.controller');
const { validateQuery } = require('../middlewares/validation');

// GET /api/lookup?ingredient=paraben
router.get('/', validateQuery('lookup'), lookupIngredient);

module.exports = router;
