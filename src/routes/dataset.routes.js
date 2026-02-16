const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/dataset.controller');

router.get('/', datasetController.getDataset);
router.post('/sync', datasetController.syncDataset);

module.exports = router;
