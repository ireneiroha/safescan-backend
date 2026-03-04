const normalizeIngredients = require('../utils/ingredientNormalizer');
const classifyIngredient = require('../utils/riskClassifier');

/**
 * Build sanitized payload for AI (only announcement text, no personal data).
 */
function buildAiPayload(input) {
  // Input is already just text, but ensure no personal data
  const sanitized = input.replace(/\b\d{10,}\b/g, '[PHONE REDACTED]') // Remove phone-like numbers
                         .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REDACTED]') // Remove emails
                         .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REDACTED]'); // Remove SSN-like patterns
  return { text: sanitized };
}

/**
 * Analyze extracted text into per-ingredient results + summary.
 * Returns:
 * {
 *   ingredients: string[],
 *   results: [{ ingredient, status, explanation, matchedKey }],
 *   summary: { total, safe, risky, restricted, unknown }
 * }
 */
module.exports = function analyzeText(text) {
  // Sanitize input for AI safety
  const payload = buildAiPayload(text);
  const sanitizedText = payload.text;

  const ingredients = normalizeIngredients(sanitizedText);

  const results = ingredients.map((ingredient) => {
    const { status, explanation, matchedKey } = classifyIngredient(ingredient);
    return { ingredient, status, explanation, matchedKey };
  });

  const summary = results.reduce(
    (acc, r) => {
      acc.total += 1;
      const k = (r.status || 'Unknown').toLowerCase();
      if (k === 'safe') acc.safe += 1;
      else if (k === 'risky') acc.risky += 1;
      else if (k === 'restricted') acc.restricted += 1;
      else acc.unknown += 1;
      return acc;
    },
    { total: 0, safe: 0, risky: 0, restricted: 0, unknown: 0 }
  );

  return { ingredients, results, summary };
};
