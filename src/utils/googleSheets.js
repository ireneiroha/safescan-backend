const { google } = require('googleapis');
const path = require('path');

let auth;

function initializeAuth() {
  if (!auth) {
    const credentialsPath = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH;
    if (!credentialsPath) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS_PATH not set');
    }
    const key = require(path.resolve(credentialsPath));
    auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }
  return auth;
}

async function fetchSheetData(sheetId, range = 'Sheet1!A1:Z') {
  const auth = initializeAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  return response.data.values || [];
}

module.exports = { fetchSheetData };
