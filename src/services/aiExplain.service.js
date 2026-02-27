const axios = require('axios');

/**
 * AI Service for explaining ingredients using external AI provider
 * Supports OpenAI and other providers via HTTP API
 */

const TIMEOUT_MS = 20000; // 20 seconds timeout

/**
 * Explain ingredients using AI
 * @param {string[]} ingredients - Array of ingredient names
 * @returns {Promise<Array>} - Array of { name, status, explanation }
 */
async function explainIngredients(ingredients) {
  const provider = process.env.AI_PROVIDER || 'openai';
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured');
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
      const correctedPrompt = prompt + '\n\nIMPORTANT: You MUST return only valid JSON array, no other text or markdown.';
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
}

/**
 * Parse AI response into structured results
 * @param {string} responseText - Raw AI response
 * @returns {Array} - Parsed results
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
  return results.map(item => ({
    name: String(item.name || item.ingredient || '').trim(),
    status: normalizeStatus(item.status),
    explanation: String(item.explanation || item.reason || '').trim()
  })).filter(item => item.name); // Filter out empty items
}

/**
 * Normalize status to Safe/Risky/Restricted
 * @param {string} status - Raw status
 * @returns {string} - Normalized status
 */
function normalizeStatus(status) {
  if (!status) return 'Safe';
  
  const normalized = String(status).toLowerCase().trim();
  
  if (['restricted', 'banned', 'high risk', 'danger'].includes(normalized)) {
    return 'Restricted';
  }
  
  if (['risky', 'moderate', 'medium risk', 'caution', 'concern'].includes(normalized)) {
    return 'Risky';
  }
  
  return 'Safe';
}

module.exports = {
  explainIngredients,
  TIMEOUT_MS
};
