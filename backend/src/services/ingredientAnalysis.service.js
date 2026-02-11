const normalizeIngredients = require('../utils/ingredientNormalizer');
const classifyIngredient = require('../utils/riskClassifier');

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
  const ingredients = normalizeIngredients(text);

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
