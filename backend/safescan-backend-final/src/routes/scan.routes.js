const router = require('express').Router();
const upload = require('../middlewares/upload');
const { scanImage, analyzeText, getHistory } = require('../controllers/scan.controller');
const { validate } = require('../middlewares/validation');

// Get scan history for authenticated user
router.get('/', getHistory);

// Image scan -> OCR -> analysis
router.post('/', upload.single('image'), scanImage);

// Analyze (edited) text -> analysis
router.post('/analyze', validate('analyzeText'), analyzeText);

module.exports = router;
