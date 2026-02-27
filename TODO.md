# TODO - AI Action Endpoint Implementation

## Implementation Tasks:
- [x] Plan the implementation
- [ ] Create src/services/aiExplain.service.js - AI service for explaining ingredients
- [ ] Create src/controllers/ai.controller.js - Controller with explainIngredients
- [ ] Create src/routes/ai.routes.js - Route file with POST /explain endpoint
- [ ] Update src/routes/index.js - Add AI route with requireAuth
- [ ] Update src/middlewares/validation.js - Add validation schema for ingredients
- [ ] Update src/docs/openapi.json - Add POST /api/aiAction endpoint documentation

## Validation Rules:
- ingredients must be array of 1-30 strings
- Each string trimmed length 2-80
- Reject empty items

## AI Service Requirements:
- Use env vars: AI_PROVIDER, AI_API_KEY, AI_MODEL
- Timeout: 20 seconds
- Retry once on non-JSON response

## Rate Limiting:
- 20 requests per 5 minutes per IP for /api/ai route
