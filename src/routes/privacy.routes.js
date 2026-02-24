const router = require('express').Router();

// GET /api/privacy - Returns privacy policy and disclaimer information
router.get('/', (req, res) => {
  res.json({
    title: 'SafeScan Privacy Policy',
    effective_date: 'TBD',
    privacy_notice: 'SafeScan is committed to protecting your privacy. We collect only your name and email for account creation and service delivery. Your data is stored securely using HTTPS encryption and industry-standard security practices. We do not share your personal information with third parties except as required for service delivery.',
    disclaimer: 'SafeScan is for informational purposes only. The ingredient analysis provided is not medical advice, diagnosis, or treatment. Always consult a healthcare professional for medical concerns. While we strive for accuracy, we cannot guarantee the completeness or reliability of the information provided.'
  });
});

module.exports = router;
