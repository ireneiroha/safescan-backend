const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'ingredients.json');
const ingredientDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Synonym mapping
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
 * GET /api/lookup
 * Public route (no auth required)
 * Query param: ingredient
 * Returns ingredient info from ingredients.json
 */
exports.lookupIngredient = async (req, res, next) => {
  try {
    const { ingredient } = req.query;

    if (!ingredient || typeof ingredient !== 'string') {
      return res.status(400).json({
        error: 'Ingredient query parameter is required'
      });
    }

    const normalized = normalizeForMatch(ingredient);
    
    // Apply synonyms
    const synonymKey = SYNONYMS[normalized];
    const searchKey = synonymKey ? normalizeForMatch(synonymKey) : normalized;

    // Exact match
    if (ingredientDb[searchKey]) {
      const hit = ingredientDb[searchKey];
      return res.json({
        ingredient: normalized,
        status: hit.status.toLowerCase(),
        explanation: hit.explanation,
        matchedKey: searchKey
      });
    }

    // Contains match
    for (const key of Object.keys(ingredientDb)) {
      if (key.length >= 4 && searchKey.includes(key)) {
        const hit = ingredientDb[key];
        return res.json({
          ingredient: normalized,
          status: hit.status.toLowerCase(),
          explanation: hit.explanation,
          matchedKey: key
        });
      }
    }

    // Paraben family
    if (/(paraben)s?$/.test(searchKey) || searchKey.includes('paraben')) {
      const hit = ingredientDb['paraben'];
      return res.json({
        ingredient: normalized,
        status: hit.status.toLowerCase(),
        explanation: hit.explanation,
        matchedKey: 'paraben'
      });
    }

    // Fragrance family
    if (searchKey.includes('fragrance') || searchKey.includes('parfum')) {
      const hit = ingredientDb['fragrance'];
      return res.json({
        ingredient: normalized,
        status: hit.status.toLowerCase(),
        explanation: hit.explanation,
        matchedKey: 'fragrance'
      });
    }

    // Not found - return unknown
    return res.json({
      ingredient: normalized,
      status: 'unknown',
      explanation: 'Not found in the current SafeScan reference list.',
      matchedKey: null
    });
  } catch (e) {
    console.error('Error looking up ingredient:', e);
    next(e);
  }
};
