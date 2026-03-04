const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'ingredients.json');
const ingredientDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// crude synonym mapping to improve match rate without heavy dependencies
const SYNONYMS = {
  'aqua': 'water',
  'perfume': 'fragrance',
  'sodium lauryl sulphate': 'sodium lauryl sulfate',
  'sodium laureth sulphate': 'sodium laureth sulfate'
};

function normalizeForMatch(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[()\[\]{}]/g, '')
    .trim();
}

/**
 * Returns { status, explanation, matchedKey }
 */
module.exports = function classifyIngredient(rawIngredient) {
  const ingredient = normalizeForMatch(rawIngredient || '');
  if (!ingredient) {
    return { status: 'Unknown', explanation: 'No ingredient provided.', matchedKey: null };
  }

  // Apply synonyms
  const synonymKey = SYNONYMS[ingredient];
  const normalized = synonymKey ? normalizeForMatch(synonymKey) : ingredient;

  // Exact match
  if (ingredientDb[normalized]) {
    const hit = ingredientDb[normalized];
    return { status: hit.status, explanation: hit.explanation, matchedKey: normalized };
  }

  // Contains match (e.g., "paraben" family)
  for (const key of Object.keys(ingredientDb)) {
    if (key.length >= 4 && normalized.includes(key)) {
      const hit = ingredientDb[key];
      return { status: hit.status, explanation: hit.explanation, matchedKey: key };
    }
  }

  // Simple heuristics for common classes
  if (/(paraben)s?$/.test(normalized) || normalized.includes('paraben')) {
    const hit = ingredientDb['paraben'] || { status: 'Risky', explanation: 'Preservative; may concern some users.' };
    return { status: hit.status, explanation: hit.explanation, matchedKey: 'paraben' };
  }

  if (normalized.includes('fragrance') || normalized.includes('parfum')) {
    const hit = ingredientDb['fragrance'] || { status: 'Risky', explanation: 'May trigger irritation or allergies in sensitive users.' };
    return { status: hit.status, explanation: hit.explanation, matchedKey: 'fragrance' };
  }

  return { status: 'Unknown', explanation: 'Not found in the current SafeScan reference list.', matchedKey: null };
};
