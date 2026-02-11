const router = require('express').Router();
const upload = require('../middlewares/upload');
const { scanImage, analyzeText } = require('../controllers/scan.controller');

// Image scan -> OCR -> analysis
router.post('/', upload.single('image'), scanImage);

// Analyze (edited) text -> analysis
router.post('/analyze', analyzeText);

module.exports = router;
