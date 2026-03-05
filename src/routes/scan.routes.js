const router = require('express').Router();
const upload = require('../middlewares/upload');
const { scanImage, analyzeText } = require('../controllers/scan.controller');
const { validate } = require('../middlewares/validation');
const optionalAuth = require('../middlewares/optionalAuth');

// Apply optionalAuth to all scan routes (allows guests and authenticated users)
router.use(optionalAuth);

// Image scan -> OCR -> analysis
router.post('/', upload.single('image'), scanImage);

// Analyze (edited) text -> analysis
router.post('/analyze', validate('analyzeText'), analyzeText);

module.exports = router;
