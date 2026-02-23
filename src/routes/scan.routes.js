const router = require('express').Router();
const upload = require('../middlewares/upload');
const { scanImage, analyzeText } = require('../controllers/scan.controller');
const { validate } = require('../middlewares/validation');

// Image scan -> OCR -> analysis
router.post('/', upload.single('image'), scanImage);

// Analyze (edited) text -> analysis
router.post('/analyze', validate('analyzeText'), analyzeText);

module.exports = router;
