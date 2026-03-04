# TODO - Update Scan Endpoints with Automatic AI Classification

## Task
Update POST /api/scan and POST /api/scan/analyze so AI runs automatically and returns classifications for ALL extracted ingredients.

## Steps

- [x] 1. Analyze current codebase and understand the flow
- [x] 2. Create plan for implementation
- [x] 3. Modify src/controllers/scan.controller.js
  - [x] 3.1 Update scanImage function with new flow
  - [x] 3.2 Update analyzeText function with new flow
  - [x] 3.3 Add helper functions for merging results
- [x] 4. Create optionalAuth middleware for guest scanning
- [x] 5. Update routes/index.js to use optionalAuth
- [x] 6. Update openapi.json documentation

## Implementation Details

Flow:
1. OCR -> get raw text
2. Extract ONLY ingredients section (start at "INGREDIENTS", stop at WARNING/DIRECTIONS/etc)
3. Split into ingredient list, trim, dedupe
4. Dataset classify known ingredients
5. For ingredients not found in dataset_rows, automatically call existing AI endpoint/service (OpenAI) in-process and classify them
6. Merge dataset + AI results into one response with summary counts
7. Save scan history with productCategory and summary fields populated (only for authenticated users)

Requirements:
- AI_API_KEY, AI_PROVIDER, AI_MODEL from env - ✅ Uses existing aiExplain.service.js
- If AI unavailable, return unknowns but do not crash - ✅ Graceful fallback
- Response must include all ingredients, not only dataset matches - ✅ Returns all ingredients in `ingredients` array

## New Features

1. **Automatic AI Classification**: Unmatched ingredients are automatically sent to AI for classification
2. **Guest Scanning**: Both scan endpoints now work without authentication
3. **All Ingredients Returned**: Response includes `ingredients` array with ALL ingredients classified
4. **Source Tracking**: Each ingredient has a `source` field (dataset/ai/unknown)
5. **Summary Counts**: Response includes `summary` with safeCount, riskyCount, restrictedCount, unknownCount

