/**
 * Extract the ingredients section from OCR text.
 * Looks for "ingredients", "ingredient list", or "composition" markers
 * and stops at common product label section markers.
 * 
 * @param {string} ocrText - Full OCR text from label
 * @returns {string} - Extracted ingredients text (or full text as fallback)
 */
function extractIngredientsSection(ocrText) {
  if (!ocrText || typeof ocrText !== 'string') {
    return '';
  }

  // Normalize for searching but preserve original for case
  const lowerText = ocrText.toLowerCase();
  
  // Start markers - any of these indicate the beginning of ingredients
  const startMarkers = [
    'ingredients',
    'ingredient list',
    'composition'
  ];
  
  // Stop markers - these indicate sections that come after ingredients
  const stopMarkers = [
    'directions',
    'how to use',
    'usage',
    'warning',
    'caution',
    'storage',
    'keep out',
    'disclaimer',
    'manufactured',
    'distributed',
    'net wt',
    'barcode',
    'batch',
    'exp',
    'expiry'
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
  
  // Find where the start marker line/paragraph ends
  // Look for newline or substantial whitespace after the marker
  const afterStartRegion = ocrText.slice(startIndex);
  const lineEndMatch = afterStartRegion.match(/[\n\r]{2,}/);
  
  let endIndex;
  if (lineEndMatch) {
    // End at first double newline (paragraph break)
    endIndex = startIndex + lineEndMatch.index;
  } else {
    // No paragraph break, take up to 800 chars
    endIndex = startIndex + 800;
  }
  
  // Now look for stop markers AFTER the start position
  let stopIndex = -1;
  for (const marker of stopMarkers) {
    const idx = lowerText.indexOf(marker, startIndex + foundStartMarker.length);
    if (idx !== -1 && (stopIndex === -1 || idx < stopIndex)) {
      stopIndex = idx;
    }
  }
  
  // If stop marker found, use that as end (but don't go past line break)
  if (stopIndex !== -1 && stopIndex < endIndex) {
    endIndex = stopIndex;
  }
  
  // Extract the ingredients section
  let ingredientsText = ocrText.slice(startIndex, endIndex).trim();
  
  // If we ended at a stop marker, include the line containing it
  if (stopIndex !== -1) {
    // Find the line containing the stop marker
    const beforeStop = ocrText.slice(0, stopIndex);
    const lastNewline = beforeStop.lastIndexOf('\n');
    const lineStart = lastNewline !== -1 ? lastNewline + 1 : 0;
    
    // Check if the stop marker is within our current endIndex on the same line
    const lineWithStop = beforeStop.slice(lineStart).toLowerCase();
    for (const marker of stopMarkers) {
      if (lineWithStop.includes(marker)) {
        // Include up to the end of that line
        const lineEnd = ocrText.indexOf('\n', stopIndex);
        if (lineEnd !== -1 && lineEnd < endIndex + 100) {
          endIndex = lineEnd;
          ingredientsText = ocrText.slice(startIndex, endIndex).trim();
        }
        break;
      }
    }
  }
  
  return ingredientsText;
}

module.exports = extractIngredientsSection;
