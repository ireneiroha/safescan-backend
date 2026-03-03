const axios = require('axios');

/**
 * Analyze text using the AI model service.
 * 
 * @param {string} text - The ingredient text to analyze
 * @returns {Promise<Object>} - Normalized AI result with risk analysis
 */
async function analyzeWithAI(text) {
  const aiServiceUrl = process.env.AI_SERVICE_URL;
  const apiKey = process.env.AI_SERVICE_API_KEY;
  const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || '10000', 10);

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if API key exists
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Build request body
  const requestBody = {
    text: text,
  };

  try {
    const response = await axios.post(
      `${aiServiceUrl}/predict`,
      requestBody,
      {
        headers,
        timeout: timeoutMs,
      }
    );

    // Normalize the AI response to our standard format
    const normalizedResult = normalizeAIResponse(response.data);
    
    return {
      ...normalizedResult,
      source: 'ai',
    };
  } catch (error) {
    // Re-throw error to allow caller to handle fallback
    throw new Error(`AI service error: ${error.message}`);
  }
}

/**
 * Normalize AI response to our standard format.
 * Handles different possible AI response formats.
 * 
 * @param {Object} aiResponse - Raw response from AI service
 * @returns {Object} - Normalized result
 */
function normalizeAIResponse(aiResponse) {
  // Handle different possible response formats
  
  // Format 1: Direct risk_level in response
  if (aiResponse.risk_level) {
    return {
      risk_level: mapRiskLevel(aiResponse.risk_level),
      matched_ingredients: mapMatchedIngredients(aiResponse.matched_ingredients || aiResponse.ingredients || []),
      explanations: aiResponse.explanations || [],
      recommendations: aiResponse.recommendations,
      model_version: aiResponse.model_version || aiResponse.version,
    };
  }

  // Format 2: Results array with risk data
  if (aiResponse.results && Array.isArray(aiResponse.results)) {
    const matchedIngredients = aiResponse.results.map((item) => ({
      name: item.ingredient || item.name || item.ingredient_name,
      risk: mapRiskLevel(item.risk || item.risk_level || item.status),
      reason: item.reason || item.explanation,
    }));

    // Determine overall risk level from results
    const riskLevels = aiResponse.results.map(r => r.risk || r.risk_level || r.status);
    const overallRisk = calculateOverallRisk(riskLevels);

    return {
      risk_level: overallRisk,
      matched_ingredients: matchedIngredients,
      explanations: aiResponse.explanations || [],
      recommendations: aiResponse.recommendations,
      model_version: aiResponse.model_version || aiResponse.version,
    };
  }

  // Format 3: predictions array
  if (aiResponse.predictions && Array.isArray(aiResponse.predictions)) {
    const matchedIngredients = aiResponse.predictions.map((pred) => ({
      name: pred.ingredient || pred.name || pred.label,
      risk: mapRiskLevel(pred.risk || pred.confidence),
      reason: pred.reason,
    }));

    return {
      risk_level: calculateOverallRisk(aiResponse.predictions.map(p => p.risk)),
      matched_ingredients: matchedIngredients,
      explanations: aiResponse.explanations || [],
      recommendations: aiResponse.recommendations,
      model_version: aiResponse.model_version,
    };
  }

  // Default: return what we have, with safe defaults
  return {
    risk_level: 'MEDIUM',
    matched_ingredients: [],
    explanations: aiResponse.message ? [aiResponse.message] : [],
    recommendations: aiResponse.recommendations,
    model_version: aiResponse.model_version,
  };
}

/**
 * Map various risk level strings to standard format
 * @param {string} risk - Raw risk level
 * @returns {string} - Normalized risk level (LOW, MEDIUM, HIGH)
 */
function mapRiskLevel(risk) {
  if (!risk) return 'MEDIUM';
  
  const normalized = String(risk).toLowerCase().trim();
  
  // LOW variants
  if (['low', 'safe', 'safe/low', 'low risk', 'no risk'].includes(normalized)) {
    return 'LOW';
  }
  
  // HIGH variants
  if (['high', 'danger', 'dangerous', 'high risk', 'restricted', 'unsafe'].includes(normalized)) {
    return 'HIGH';
  }
  
  // MEDIUM variants (default)
  return 'MEDIUM';
}

/**
 * Map matched ingredients to standard format
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {Array} - Normalized ingredients array
 */
function mapMatchedIngredients(ingredients) {
  if (!Array.isArray(ingredients)) return [];
  
  return ingredients.map((ing) => ({
    name: ing.name || ing.ingredient || ing.ingredient_name || ing.label || 'Unknown',
    risk: mapRiskLevel(ing.risk || ing.risk_level || ing.status),
    reason: ing.reason || ing.explanation,
  }));
}

/**
 * Calculate overall risk level from individual ingredient risks
 * @param {Array} riskLevels - Array of risk level strings
 * @returns {string} - Overall risk level
 */
function calculateOverallRisk(riskLevels) {
  if (!riskLevels || riskLevels.length === 0) return 'MEDIUM';
  
  const hasHigh = riskLevels.some(r => {
    const normalized = String(r).toLowerCase().trim();
    return ['high', 'danger', 'dangerous', 'restricted'].includes(normalized);
  });
  
  if (hasHigh) return 'HIGH';
  
  const hasMedium = riskLevels.some(r => {
    const normalized = String(r).toLowerCase().trim();
    return ['medium', 'moderate', 'risky', 'caution'].includes(normalized);
  });
  
  if (hasMedium) return 'MEDIUM';
  
  return 'LOW';
}

module.exports = {
  analyzeWithAI,
};
