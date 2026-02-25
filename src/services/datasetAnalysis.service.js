const db = require('../db');
const normalizeIngredients = require('../utils/ingredientNormalizer');

/**
 * Query dataset_rows table to find ingredient matches.
 * Supports exact match, alias match, and case-insensitive matching.
 * 
 * @param {string[]} ingredients - Array of normalized ingredient tokens
 * @returns {Promise<Object>} - Matched ingredients with risk levels and reasons
 */
async function analyzeWithDataset(ingredients) {
  if (!ingredients || ingredients.length === 0) {
    return {
      matched_ingredients: [],
      explanations: [],
      risk_level: 'LOW'
    };
  }

  try {
    const client = await db.pool.connect();
    
    try {
      // Build query to match ingredients
      // Try exact match on ingredient_name, then aliases, then case-insensitive
      const matches = [];
      
      for (const ingredient of ingredients) {
        // First try exact match on ingredient_name
        let result = await client.query(
          `SELECT ingredient_name, risk_level, reason, aliases 
           FROM dataset_rows 
           WHERE LOWER(ingredient_name) = LOWER($1)`,
          [ingredient]
        );
        
        // If no exact match, try alias matching
        if (result.rows.length === 0) {
          result = await client.query(
            `SELECT ingredient_name, risk_level, reason, aliases 
             FROM dataset_rows 
             WHERE $1 LIKE '%' || LOWER(aliases) || '%' OR 
                   LOWER($1) = LOWER(aliases)`,
            [ingredient.toLowerCase()]
          );
        }
        
        // If still no match, try case-insensitive contains match
        if (result.rows.length === 0) {
          result = await client.query(
            `SELECT ingredient_name, risk_level, reason, aliases 
             FROM dataset_rows 
             WHERE LOWER($1) LIKE '%' || LOWER(ingredient_name) || '%'`,
            [ingredient]
          );
        }
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          matches.push({
            name: row.ingredient_name,
            risk_level: row.risk_level,
            reason: row.reason,
            matched_on: ingredient
          });
        }
      }
      
      // Build response
      const matchedIngredients = matches.map(m => ({
        name: m.name,
        risk_level: m.risk_level,
        reason: m.reason
      }));
      
      // Collect unique explanations
      const explanations = [...new Set(matches.map(m => m.reason).filter(Boolean))];
      
      // Determine overall risk level
      const riskLevel = determineOverallRiskLevel(matches);
      
      return {
        matched_ingredients: matchedIngredients,
        explanations,
        risk_level: riskLevel
      };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    // Log error and re-throw to allow fallback to rule-based analysis
    console.error('Dataset analysis error:', error.message);
    throw error;
  }
}

/**
 * Determine overall risk level from matched ingredients
 * HIGH > MEDIUM > LOW
 */
function determineOverallRiskLevel(matches) {
  if (!matches || matches.length === 0) {
    return 'LOW';
  }
  
  const hasHigh = matches.some(m => m.risk_level === 'HIGH');
  const hasMedium = matches.some(m => m.risk_level === 'MEDIUM');
  
  if (hasHigh) return 'HIGH';
  if (hasMedium) return 'MEDIUM';
  return 'LOW';
}

/**
 * Analyze text using the dataset
 * This is the main entry point that combines normalization with dataset lookup
 * 
 * @param {string} text - Raw ingredient text
 * @returns {Promise<Object>} - Analysis result
 */
async function analyzeTextWithDataset(text) {
  // Normalize the input text into ingredient tokens
  const ingredients = normalizeIngredients(text);
  
  // Query dataset for matches
  const datasetResult = await analyzeWithDataset(ingredients);
  
  // If no matches found, return default low risk
  if (datasetResult.matched_ingredients.length === 0) {
    return {
      ...datasetResult,
      explanations: ['No flagged ingredients found in dataset.']
    };
  }
  
  return datasetResult;
}

/**
 * Check if dataset has any data
 * Used to determine if dataset-based analysis is available
 */
async function isDatasetAvailable() {
  try {
    const result = await db.pool.query('SELECT COUNT(*) as count FROM dataset_rows');
    const count = parseInt(result.rows[0].count);
    return count > 0;
  } catch (error) {
    console.warn('Dataset availability check failed:', error.message);
    return false;
  }
}

module.exports = {
  analyzeWithDataset,
  analyzeTextWithDataset,
  isDatasetAvailable
};
