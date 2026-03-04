const db = require('../db');
const { parseIngredientTokens, extractIngredientsSection } = require('../utils/extractIngredientsSection');

/**
 * Query dataset_rows table to find ingredient matches.
 * ONLY exact token match (case-insensitive) on ingredient_name
 * and alias match only if aliases contains an exact token (comma-separated).
 * 
 * @param {string[]} tokens - Array of normalized ingredient tokens
 * @returns {Promise<Object>} - Matched ingredients with risk levels and reasons
 */
async function analyzeWithDataset(tokens) {
  if (!tokens || tokens.length === 0) {
    return {
      matched_ingredients: [],
      explanations: [],
      risk_level: 'LOW',
      summary: { safeCount: 0, riskyCount: 0, restrictedCount: 0 }
    };
  }

  try {
    const client = await db.pool.connect();
    
    try {
      // Debug: Log parsed tokens
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        console.log('[DatasetAnalysis] parsedTokens:', tokens);
      }
      
      const matches = [];
      const matchedNames = new Set();
      
      for (const token of tokens) {
        // Clean token before querying
        const cleaned = token.trim().toLowerCase();
        if (!cleaned) continue;
        
        // First: Exact token match on ingredient_name (case-insensitive)
        let result = await client.query(
          `SELECT ingredient_name, risk_level, reason, aliases 
           FROM dataset_rows 
           WHERE LOWER(ingredient_name) = $1`,
          [cleaned]
        );
        
        // Second: Alias match only if exact match fails
        // Use trim-safe version to handle spaces after commas
        if (result.rows.length === 0) {
          result = await client.query(
            `SELECT ingredient_name, risk_level, reason, aliases 
             FROM dataset_rows 
             WHERE EXISTS (
               SELECT 1
               FROM unnest(string_to_array(LOWER(COALESCE(aliases,'')), ',')) a(alias)
               WHERE TRIM(a.alias) = $1
             )`,
            [cleaned]
          );
        }
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          
          // Avoid duplicates
          if (!matchedNames.has(row.ingredient_name.toLowerCase())) {
            matchedNames.add(row.ingredient_name.toLowerCase());
            matches.push({
              input: token,
              name: row.ingredient_name,
              risk_level: row.risk_level,
              reason: row.reason
            });
          }
        }
      }
      
      // Debug: Log matched names count
      if (isDev) {
        console.log('[DatasetAnalysis] matchedNames count:', matchedNames.size);
        console.log('[DatasetAnalysis] matchedNames:', [...matchedNames]);
      }
      
      // Build response - return canonical name and input token separately
      const matchedIngredients = matches.map(m => ({
        input: m.input,
        name: m.name,
        risk_level: m.risk_level,
        reason: m.reason
      }));
      
      // Collect unique explanations
      const explanations = [...new Set(matches.map(m => m.reason).filter(Boolean))];
      
      // Calculate summary counts
      const summary = {
        safeCount: matches.filter(m => m.risk_level === 'LOW').length,
        riskyCount: matches.filter(m => m.risk_level === 'MEDIUM').length,
        restrictedCount: matches.filter(m => m.risk_level === 'HIGH').length
      };
      
      // Determine overall risk level
      const riskLevel = determineOverallRiskLevel(matches);
      
      // If no matches found, return explicit message
      if (matchedIngredients.length === 0) {
        return {
          matched_ingredients: [],
          explanations: ['No dataset matches found'],
          risk_level: 'LOW',
          summary: { safeCount: 0, riskyCount: 0, restrictedCount: 0 }
        };
      }
      
      return {
        matched_ingredients: matchedIngredients,
        explanations,
        risk_level: riskLevel,
        summary
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
 * Match ingredients against dataset and return known results + unknown names.
 * Preserves the original order of tokens and deduplicates unknownNames.
 * 
 * @param {string[]} tokens - Array of normalized ingredient tokens (in order)
 * @returns {Promise<Object>} - { knownResults: [], unknownNames: [] }
 */
async function matchIngredientsWithDataset(tokens) {
  if (!tokens || tokens.length === 0) {
    return { knownResults: [], unknownNames: [] };
  }

  try {
    const client = await db.pool.connect();
    
    try {
      const knownResults = [];
      const unknownNames = [];
      const knownLower = new Set(); // Track known results to avoid duplicates in order
      const unknownLower = new Set(); // Track unknown names to deduplicate
      
      for (const token of tokens) {
        // Clean token before querying
        const cleaned = token.trim().toLowerCase();
        if (!cleaned) continue;
        
        // First: Exact token match on ingredient_name (case-insensitive)
        let result = await client.query(
          `SELECT ingredient_name, risk_level, reason, aliases 
           FROM dataset_rows 
           WHERE LOWER(ingredient_name) = $1`,
          [cleaned]
        );
        
        // Second: Alias match only if exact match fails
        // Use trim-safe version to handle spaces after commas
        if (result.rows.length === 0) {
          result = await client.query(
            `SELECT ingredient_name, risk_level, reason, aliases 
             FROM dataset_rows 
             WHERE EXISTS (
               SELECT 1
               FROM unnest(string_to_array(LOWER(COALESCE(aliases,'')), ',')) a(alias)
               WHERE TRIM(a.alias) = $1
             )`,
            [cleaned]
          );
        }
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          const rowLower = row.ingredient_name.toLowerCase();
          
          // Only add if not already added (preserve first appearance order)
          if (!knownLower.has(rowLower)) {
            knownLower.add(rowLower);
            knownResults.push({
              input: token,
              name: row.ingredient_name,
              status: mapDatasetRiskToStatus(row.risk_level),
              reason: row.reason,
              source: 'dataset'
            });
          }
        } else {
          // Not found in dataset - add to unknown list if not already there
          if (!unknownLower.has(cleaned)) {
            unknownLower.add(cleaned);
            unknownNames.push(token); // Keep original casing
          }
        }
      }
      
      return { knownResults, unknownNames };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Dataset match error:', error.message);
    throw error;
  }
}

/**
 * Map dataset risk level to status string (Safe|Risky|Restricted)
 */
function mapDatasetRiskToStatus(riskLevel) {
  switch (riskLevel) {
    case 'LOW':
      return 'Safe';
    case 'MEDIUM':
      return 'Risky';
    case 'HIGH':
      return 'Restricted';
    default:
      return 'Unknown';
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
  // Parse input text into ingredient tokens using improved tokenizer
  const tokens = parseIngredientTokens(text);
  
  // Debug: Log parsed tokens in dev mode
  const isDev = process.env.NODE_ENV !== 'production';
  const debug = isDev ? { tokens: tokens, matched_names: [] } : undefined;
  
  // Query dataset for matches
  const datasetResult = await analyzeWithDataset(tokens);
  
  // Add debug info in development mode
  if (isDev) {
    datasetResult.debug = {
      tokens: tokens,
      matched_names: datasetResult.matched_ingredients.map(m => m.name)
    };
  }
  
  // If no matches found, return default low risk with explicit message
  if (datasetResult.matched_ingredients.length === 0) {
    return {
      ...datasetResult,
      explanations: ['No dataset matches found']
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

/**
 * Map dataset risk level to scan_ingredients risk value
 * LOW -> safe, MEDIUM -> risky, HIGH -> restricted
 */
function mapRiskLevelToScanRisk(riskLevel) {
  switch (riskLevel) {
    case 'LOW':
      return 'safe';
    case 'MEDIUM':
      return 'risky';
    case 'HIGH':
      return 'restricted';
    default:
      return 'unknown';
  }
}

module.exports = {
  analyzeWithDataset,
  analyzeTextWithDataset,
  matchIngredientsWithDataset,
  isDatasetAvailable,
  mapRiskLevelToScanRisk,
  parseIngredientTokens,
  extractIngredientsSection
};

