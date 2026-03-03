const axios = require('axios');
const FormData = require('form-data');

// OCR.Space API configuration
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';

// Controlled error class for OCR errors
class OCRError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'OCRError';
    this.code = code;
  }
}

/**
 * Run OCR on a Buffer using OCR.Space API.
 * Returns extracted text.
 * Throws controlled errors with codes.
 */
module.exports = async function extractTextFromImage(imageBuffer) {
  // Validate input
  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    throw new OCRError('Invalid image buffer', 'OCR_INVALID_INPUT');
  }

  // Check if API key is configured
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    const error = new OCRError('OCR service not configured. Set OCR_SPACE_API_KEY in environment.', 'OCR_NOT_CONFIGURED');
    throw error;
  }

  try {
    // Create form data with the image buffer
    const form = new FormData();
    form.append('apikey', apiKey);
    form.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    });
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    form.append('scale', 'true');
    form.append('OCREngine', '2');

    // Send request to OCR.Space API
    const response = await axios.post(OCR_SPACE_API_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });

    // Check for OCR.Space specific errors
    if (response.data.IsErroredOnProcessing) {
      const errorMessage = response.data.ErrorMessage?.[0] || 'OCR processing failed';
      console.error('OCR.Space API error:', errorMessage);
      
      // Handle specific error codes from OCR.Space
      if (errorMessage.includes('daily')) {
        throw new OCRError('OCR daily limit exceeded', 'OCR_DAILY_LIMIT');
      }
      if (errorMessage.includes('credit') || errorMessage.includes('key')) {
        throw new OCRError('OCR API key invalid or insufficient credits', 'OCR_AUTH_FAILED');
      }
      
      throw new OCRError(`OCR processing failed: ${errorMessage}`, 'OCR_FAILED');
    }

    // Check if parsed results exist
    if (!response.data.ParsedResults || response.data.ParsedResults.length === 0) {
      console.warn('OCR.Space returned no results');
      return '';
    }

    // Extract text from the first result
    const parsedText = response.data.ParsedResults[0]?.ParsedText || '';
    return parsedText.trim();

  } catch (error) {
    // If it's already a controlled error, rethrow it
    if (error instanceof OCRError) {
      throw error;
    }

    // Log detailed error info for debugging
    if (error.response) {
      console.error('OCR.Space response error:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('OCR.Space request failed (network error):', error.message);
    } else {
      console.error('OCR.Space error:', error.message);
    }

    // Check for network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new OCRError('OCR service unavailable due to network issue', 'OCR_NETWORK_ERROR');
    }

    // Check for timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new OCRError('OCR service timed out', 'OCR_TIMEOUT');
    }

    // For any other unexpected errors, throw a controlled error
    const controlledError = new OCRError('OCR processing failed', 'OCR_FAILED');
    controlledError.originalError = error;
    throw controlledError;
  }
};
