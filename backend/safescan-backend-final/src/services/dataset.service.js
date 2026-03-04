const crypto = require('crypto');
const NodeCache = require('node-cache');
const { fetchSheetData } = require('../utils/googleSheets');
const { fetchCsvData } = require('../utils/csvParser');
const datasetRepository = require('../repositories/dataset.repository');

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

function normalizeHeader(header) {
  return header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function normalizeRow(row, headers) {
  const normalized = {};
  headers.forEach((header, index) => {
    let value = row[index] || '';
    // Convert to number if possible
    if (!isNaN(value) && value !== '') {
      value = parseFloat(value);
    }
    normalized[normalizeHeader(header)] = value;
  });
  return normalized;
}

function generateRowHash(row) {
  return crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex');
}

class DatasetService {
  async sync(sheetId, range = 'Sheet1!A1:Z', useCsvFallback = false) {
    const cacheKey = `${sheetId}_${range}`;
    let rows = cache.get(cacheKey);

    if (!rows) {
      try {
        if (useCsvFallback) {
          rows = await fetchCsvData(sheetId);
        } else {
          rows = await fetchSheetData(sheetId, range);
        }
        cache.set(cacheKey, rows);
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        throw new Error('Failed to fetch data from Google Sheets');
      }
    }

    if (!rows.length) return { inserted: 0, updated: 0, skipped: 0, totalFetched: 0 };

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const normalizedRows = dataRows.map((row, index) => {
      const normalized = normalizeRow(row, headers);
      const rowHash = generateRowHash(normalized);
      return {
        row_hash: rowHash,
        data: normalized,
        source_sheet_id: sheetId,
        source_range: range,
      };
    });

    const result = await datasetRepository.upsertMany(normalizedRows);
    return { ...result, totalFetched: dataRows.length };
  }

  async getDataset(query) {
    const { page = 1, limit = 20, search, sortBy = 'updated_at', order = 'desc', ...filters } = query;
    const data = await datasetRepository.list({ page: parseInt(page), limit: parseInt(limit), search, sortBy, order, filters });
    const total = await datasetRepository.count({ search, filters });
    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      data,
    };
  }
}

module.exports = new DatasetService();
