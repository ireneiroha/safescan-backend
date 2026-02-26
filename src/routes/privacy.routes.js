const router = require('express').Router();

// GET /api/privacy - Returns privacy policy and disclaimer information
router.get('/', (req, res) => {
  res.json({
    title: 'SafeScan Privacy Policy & Disclaimer',
    effective_date: '26 February 2026',
    privacy_notice: 'SafeScan is committed to protecting your privacy. We collect only minimal data necessary for account creation and service delivery - your email address and password. Your password is securely hashed using industry-standard bcrypt encryption. We use your data solely for account creation and delivering our ingredient analysis service. Under POPIA and GDPR regulations, you have the right to request deletion of your personal data at any time. Contact us to request data deletion. We do not share your personal information with third parties except as required for service delivery.',
    disclaimer: 'SafeScan is for informational purposes only. The ingredient analysis provided is not medical advice, diagnosis, or treatment. Always consult a healthcare professional for medical concerns. While we strive for accuracy, we cannot guarantee the completeness or reliability of the information provided.'
  });
});

module.exports = router;
