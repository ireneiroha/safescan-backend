const axios = require('axios');

/**
 * AI Service for explaining ingredients using external AI provider
 * Supports OpenAI and other providers via HTTP API
 * 
 * Configuration (from environment variables):
 * - AI_API_KEY (required): API key for AI provider
 * - AI_PROVIDER (default "openai"): AI provider name
 * - AI_MODEL (default "gpt-4o-mini"): Model to use
 * - MAX_AI_INGREDIENTS (default 25): Maximum ingredients per AI batch
 */

const TIMEOUT_MS = 20000; // 20 seconds timeout
const MAX_AI_INGREDIENTS = parseInt(process.env.MAX_AI_INGREDIENTS || '25', 10);

/**
 * Normalize ingredient name for matching
 * - lowercases, trims
 * - collapses multiple spaces
 * - removes trailing punctuation
 * - strips surrounding quotes
 * @param {string} name - Raw ingredient name
 * @returns {string} - Normalized string
 */
function normalizeName(name) {
  if (!name) return '';
  
  let normalized = String(name).toLowerCase().trim();
  
  // Collapse multiple spaces into single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove trailing punctuation
  normalized = normalized.replace(/[.,;:!?"']+$/, '');
  
  // Remove surrounding quotes
  normalized = normalized.replace(/^["']|["']$/g, '');
  
  // Trim again after punctuation removal
  normalized = normalized.trim();
  
  return normalized;
}

// Get API key - ONLY from AI_API_KEY (no fallback)
function getApiKey() {
  return process.env.AI_API_KEY;
}

// Check if API key is configured
function isApiKeyConfigured() {
  return !!process.env.AI_API_KEY;
}

// Get provider configuration and log it (never log the API key value)
function getProviderConfig() {
  const provider = process.env.AI_PROVIDER || 'openai';
  const apiKey = getApiKey();
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  
  // Log provider, model, and whether API key is set (NEVER log the key value)
  const apiKeyStatus = isApiKeyConfigured() ? 'set' : 'not set';
  console.log(`[AI Service] Provider: ${provider}, Model: ${model}, AI_API_KEY: ${apiKeyStatus}`);
  
  return { provider, apiKey, model };
}

/**
 * Explain ingredients using AI (single batch)
 * @param {string[]} ingredients - Array of ingredient names
 * @returns {Promise<Array>} - Array of { name, status, explanation }
 */
async function explainIngredients(ingredients) {
  const { provider, apiKey, model } = getProviderConfig();

  if (!apiKey) {
    throw new Error('AI not configured. Missing AI_API_KEY');
  }

  const prompt = buildPrompt(ingredients);

  try {
    return await callAIWithRetry(provider, apiKey, model, prompt, 0);
  } catch (error) {
    console.error('AI explain error:', error.message);
    throw error;
  }
}

/**
 * Explain ingredients using AI with automatic batching
 * Processes all ingredients in batches, deduplicates, and ensures output matches input
 * @param {string[]} ingredients - Array of ingredient names
 * @param {number} batchSize - Maximum ingredients per batch (default MAX_AI_INGREDIENTS)
 * @returns {Promise<Array>} - Array of { name, status, explanation }
 */
async function explainIngredientsBatched(ingredients, batchSize = MAX_AI_INGREDIENTS) {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }

  // Deduplicate input while preserving original casing for output
  const seen = new Map(); // normalizedName -> originalName
  const uniqueIngredients = [];
  
  for (const ing of ingredients) {
    const normalized = normalizeName(ing);
    if (normalized && !seen.has(normalized)) {
      seen.set(normalized, ing);
      uniqueIngredients.push(ing);
    }
  }

  if (uniqueIngredients.length === 0) {
    return [];
  }

  // Split into batches
  const batches = [];
  for (let i = 0; i < uniqueIngredients.length; i += batchSize) {
    batches.push(uniqueIngredients.slice(i, i + batchSize));
  }

  // Process each batch and collect results
  const allResults = [];
  const aiReturnedNames = new Set();

  for (const batch of batches) {
    try {
      const batchResults = await explainIngredients(batch);
      
      if (batchResults && Array.isArray(batchResults)) {
        for (const result of batchResults) {
          const normalizedResultName = normalizeName(result.name);
          aiReturnedNames.add(normalizedResultName);
          allResults.push({
            name: result.name,
            status: result.status,
            explanation: result.explanation
          });
        }
      }
    } catch (error) {
      console.warn(`AI batch failed: ${error.message}`);
      // Continue with other batches
    }
  }

  // Create a lookup map for quick access
  const resultLookup = new Map();
  for (const result of allResults) {
    const normalized = normalizeName(result.name);
    resultLookup.set(normalized, result);
  }

  // Build final output - one entry per original input ingredient
  const finalOutput = [];
  
  for (const ing of ingredients) {
    const normalized = normalizeName(ing);
    const result = resultLookup.get(normalized);
    
    if (result) {
      // Use the original input name to preserve casing, but use the AI's status/explanation
      finalOutput.push({
        name: ing, // Use original input name
        status: result.status,
        explanation: result.explanation
      });
    } else {
      // AI did not return an entry for this ingredient
      finalOutput.push({
        name: ing,
        status: 'Safe', // Default to Safe when AI doesn't return
        explanation: 'No AI output returned for this ingredient.'
      });
    }
  }

  return finalOutput;
}

/**
 * Health check for AI service
 * @returns {Promise<{status: string, provider: string, model: string}>}
 */
async function checkHealth() {
  const { provider, apiKey, model } = getProviderConfig();
  
  return {
    status: apiKey ? 'available' : 'missing_api_key',
    provider: provider,
    model: model
  };
}

/**
 * Build the prompt for AI to classify ingredients
 * @param {string[]} ingredients - Array of ingredient names
 * @returns {string} - Formatted prompt
 */
function buildPrompt(ingredients) {
  const ingredientList = ingredients.map(ing => `- ${ing}`).join('\n');

  return `You are a cosmetic safety expert. Classify the following cosmetic/skincare ingredients as "Safe", "Risky", or "Restricted" and provide a brief 1-2 sentence explanation for each.

For cosmetic safety context:
- "Safe": Generally considered safe for use in cosmetics at normal concentrations
- "Risky": May cause irritation, sensitivity, or have some concerns for certain skin types
- "Restricted": Known to be restricted or banned in some regions, or have significant safety concerns

IMPORTANT:
- Return ONLY a valid JSON array with objects containing: name, status, explanation
- Do NOT include any markdown, text, or explanations outside the JSON
- Do NOT make medical claims
- This is informational only
- For each ingredient in the input list, include exactly one entry in the output with the same name

Ingredients to classify:
${ingredientList}

Return JSON in this exact format:
[
  { "name": "ingredient name", "status": "Safe|Risky|Restricted", "explanation": "brief explanation" }
]`;
}

/**
 * Call AI provider with retry logic
 * @param {string} provider - AI provider (openai, etc)
 * @param {string} apiKey - API key
 * @param {string} model - Model name
 * @param {string} prompt - Prompt to send
 * @param {number} retryCount - Current retry count
 * @returns {Promise<Array>} - Parsed results
 */
async function callAIWithRetry(provider, apiKey, model, prompt, retryCount) {
  try {
    const response = await callAIProvider(provider, apiKey, model, prompt);
    
    // Try to parse the response
    const results = parseAIResponse(response);
    
    if (!results || !Array.isArray(results)) {
      throw new Error('Invalid response format');
    }
    
    return results;
  } catch (error) {
    // Retry once if we got a non-JSON response or parsing error
    if (retryCount < 1 && (error.message.includes('JSON') || error.message.includes('parse'))) {
      console.warn('AI response parse error, retrying with correction prompt...');
      const correctedPrompt = prompt + '\n\nIMPORTANT: You MUST return only valid JSON array, no other text or markdown. Include an entry for every ingredient in the input.';
      return callAIWithRetry(provider, apiKey, model, correctedPrompt, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Call the AI provider API
 * @param {string} provider - AI provider
 * @param {string} apiKey - API key
 * @param {string} model - Model name
 * @param {string} prompt - Prompt
 * @returns {Promise<string>} - AI response text
 */
async function callAIProvider(provider, apiKey, model, prompt) {
  if (provider === 'openai') {
    return callOpenAI(apiKey, model, prompt);
  }
  
  // Default to OpenAI-compatible API
  return callOpenAI(apiKey, model, prompt);
}

/**
 * Call OpenAI API
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - Model name
 * @param {string} prompt - Prompt
 * @returns {Promise<string>} - AI response text
 */
async function callOpenAI(apiKey, model, prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT_MS
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenAI response format');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    // Better error logging for OpenAI call
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      let responseBody = '';
      try {
        responseBody = JSON.stringify(error.response.data);
      } catch (e) {
        responseBody = String(error.response.data);
      }
      // Truncate to 500 chars
      responseBody = responseBody.substring(0, 500);
      
      console.error(`[OpenAI Error] Status: ${statusCode}, Response: ${responseBody}, Message: ${error.message}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error(`[OpenAI Error] No response received, Message: ${error.message}`);
    } else {
      // Error setting up request
      console.error(`[OpenAI Error] Request setup failed, Message: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parse AI response into structured results
 * @param {string} responseText - Raw AI response
 * @returns {Array} - Parsed results with normalized names
 */
function parseAIResponse(responseText) {
  // Try to extract JSON from the response
  // The response might have markdown code blocks or extra text
  let jsonStr = responseText.trim();
  
  // Remove markdown code blocks if present
  const codeBlockRegex = /^\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`$/;
  const match = jsonStr.match(codeBlockRegex);
  if (match) {
    jsonStr = match[1].trim();
  }
  
  // Try to find JSON array in the response
  const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }
  
  const results = JSON.parse(jsonStr);
  
  // Validate and normalize the results
  // Also create normalized_name internally for matching
  return results.map(item => {
    const name = String(item.name || item.ingredient || '').trim();
    return {
      name: name,
      normalized_name: normalizeName(name), // Internal use for matching
      status: normalizeStatus(item.status),
      explanation: String(item.explanation || item.reason || '').trim()
    };
  }).filter(item => item.name); // Filter out empty items
}

/**
 * Normalize status to Safe/Risky/Restricted
 * Only returns Safe, Risky, or Restricted - no Unknown
 * @param {string} status - Raw status
 * @returns {string} - Normalized status
 */
function normalizeStatus(status) {
  if (!status) return 'Safe';
  
  const normalized = String(status).toLowerCase().trim();
  
  // Map Unknown/Not sure to Risky (conservative approach)
  if (['unknown', 'not sure', 'unsure', 'unclear'].includes(normalized)) {
    return 'Risky';
  }
  
  if (['restricted', 'banned', 'high risk', 'danger'].includes(normalized)) {
    return 'Restricted';
  }
  
  if (['risky', 'moderate', 'medium risk', 'caution', 'concern'].includes(normalized)) {
    return 'Risky';
  }
  
  // Default to Safe for any unrecognized values
  return 'Safe';
}

module.exports = {
  explainIngredients,
  explainIngredientsBatched,
  normalizeName,
  checkHealth,
  isApiKeyConfigured,
  TIMEOUT_MS,
  MAX_AI_INGREDIENTS
};

