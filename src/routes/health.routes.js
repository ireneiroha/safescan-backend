const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'safescan-backend',
    time: new Date().toISOString(),
    requestId: req.id,
  });
});

module.exports = router;
