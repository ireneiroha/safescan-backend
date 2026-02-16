const datasetService = require('../services/dataset.service');

const getDataset = async (req, res, next) => {
  try {
    const data = await datasetService.getDataset(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const syncDataset = async (req, res, next) => {
  try {
    const { sheetId, range, useCsvFallback } = req.body;
    if (!sheetId) {
      return res.status(400).json({ error: 'sheetId is required' });
    }
    const result = await datasetService.sync(sheetId, range, useCsvFallback);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDataset,
  syncDataset,
};
