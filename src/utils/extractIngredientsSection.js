/**
 * Extract the ingredients section from OCR text.
 * Looks for "ingredients", "ingredient:", or "ingredients:" markers
 * and stops at common product label section markers.
 * 
 * @param {string} ocrText - Full OCR text from label
 * @returns {string} - Extracted ingredients text (or full text as fallback)
 */
function extractIngredientsSection(ocrText) {
  if (!ocrText || typeof ocrText !== 'string') {
    return '';
  }

  // Normalize for searching (lowercase)
  const lowerText = ocrText.toLowerCase();
  
  // Start markers - any of these indicate the beginning of ingredients
  const startMarkers = [
    'ingredients',
    'ingredient:',
    'ingredients:'
  ];
  
  // Stop markers - these indicate sections that come after ingredients
  const stopMarkers = [
    'refrigerate',
    'storage',
    'keep refrigerated',
    'after opening',
    'packed for',
    'distributed by',
    'manufactured',
    'net wt',
    'best by',
    'expiry',
    'exp',
    'warning',
    'caution',
    'directions',
    'how to use'
  ];
  
  // Find the first start marker
  let startIndex = -1;
  let foundStartMarker = null;
  
  for (const marker of startMarkers) {
    const idx = lowerText.indexOf(marker);
    if (idx !== -1 && (startIndex === -1 || idx < startIndex)) {
      startIndex = idx;
      foundStartMarker = marker;
    }
  }
  
  // If no ingredients marker found, return full text as fallback
  if (startIndex === -1) {
    return ocrText;
  }
  
  // Find where the start marker ends (move past the marker)
  const afterStartStart = startIndex + foundStartMarker.length;
  
  // Find the first stop marker AFTER the start position
  let stopIndex = -1;
  for (const marker of stopMarkers) {
    const idx = lowerText.indexOf(marker, afterStartStart);
    if (idx !== -1 && (stopIndex === -1 || idx < stopIndex)) {
      stopIndex = idx;
    }
  }
  
  // Determine end index
  let endIndex;
  if (stopIndex !== -1) {
    // Stop at the stop marker
    endIndex = stopIndex;
  } else {
    // No stop marker found, cap at 1200 chars
    endIndex = startIndex + 1200;
  }
  
  // Extract the ingredients section
  let ingredientsText = ocrText.slice(startIndex, endIndex).trim();
  
  return ingredientsText;
}

/**
 * Parse ingredient text into tokens.
 * Keeps multi-word ingredients intact (e.g., "apple cider vinegar").
 * 
 * @param {string} text - Ingredient text
 * @returns {string[]} - Array of ingredient tokens
 */
function parseIngredientTokens(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Remove leading "INGREDIENTS:" / "Ingredients:" label
  let cleaned = text.replace(/^(ingredients|ingredient)s?\s*[:\-–]?\s*/i, '');
  
  // Replace newlines with spaces
  cleaned = cleaned.replace(/[\r\n]+/g, ' ');
  
  // Remove trailing punctuation: . ) ( : ; 
  cleaned = cleaned.replace(/[.():;]+$/g, '');
  cleaned = cleaned.replace(/^[.():;]+/g, '');
  
  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Trim
  cleaned = cleaned.trim();
  
  // Split primarily by commas and semicolons
  const parts = cleaned.split(/[,;]+/g);
  
  const tokens = [];
  const seen = new Set();
  
  for (let part of parts) {
    // Trim whitespace
    part = part.trim();
    
    // Remove any remaining punctuation from edges
    part = part.replace(/^[.():;"']+/, '');
    part = part.replace(/[.():;"']+$/, '');
    
    // Trim again
    part = part.trim();
    
    // Lowercase
    part = part.toLowerCase();
    
    // Ignore tokens shorter than 2 chars
    if (part.length < 2) {
      continue;
    }
    
    // Skip duplicates
    if (seen.has(part)) {
      continue;
    }
    
    seen.add(part);
    tokens.push(part);
  }
  
  return tokens;
}

module.exports = extractIngredientsSection;
module.exports.parseIngredientTokens = parseIngredientTokens;
