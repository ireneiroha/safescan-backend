const COMMON_PREFIX_RE = /^\s*(ingredients|ingredient|ingrédients)\s*[:\-–]?\s*/i;

function cleanToken(token) {
  let t = token
    .replace(/\s+/g, ' ')
    .replace(/[•·•]/g, ' ')
    .trim();

  // remove trailing punctuation
  t = t.replace(/[\.;:]+$/g, '').trim();

  // strip surrounding parentheses/brackets
  t = t.replace(/^\((.*)\)$/,'$1').trim();

  // remove common prefixes like "Ingredients:"
  t = t.replace(COMMON_PREFIX_RE, '').trim();

  return t.toLowerCase();
}

/**
 * Normalize OCR/extracted text into a list of ingredient tokens.
 * Splits on commas, semicolons, pipes, newlines, and bullet separators.
 */
module.exports = function normalizeIngredients(text) {
  if (!text || typeof text !== 'string') return [];

  const cleaned = text
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(COMMON_PREFIX_RE, '')
    .trim();

  // Split on common delimiters
  const parts = cleaned.split(/[,;|\n]+/g);

  const tokens = parts
    .map(cleanToken)
    .filter(Boolean)
    // remove very short noise
    .filter(t => t.length > 1);

  // de-duplicate while preserving order
  const seen = new Set();
  const out = [];
  for (const t of tokens) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
};
