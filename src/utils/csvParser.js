const axios = require('axios');
const csv = require('csv-parser');
const { Transform } = require('stream');

function getCsvExportUrl(sheetId, gid = 0) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

async function fetchCsvData(sheetId, gid = 0) {
  const url = getCsvExportUrl(sheetId, gid);
  const response = await axios.get(url, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const results = [];
    response.data
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

module.exports = { fetchCsvData };
