# TODO: Fix Scan Saving Issue

## Task Summary
Fix the scan controller so authenticated requests save scans and return scanId.

## Steps
- [x] 1. Update userId derivation in scanImage controller to use nullish coalescing operator (??)
- [x] 2. Update userId derivation in analyzeText controller to use nullish coalescing operator (??)
- [x] 3. Verify overall_risk is correctly mapped from analysis.risk_level
- [x] 4. Ensure scan_ingredients inserts use the returned scanId
- [x] 5. Verify rollback and detailed error logging is present
- [x] 6. Verify saveError is included in API response when saved=false

## Database Schema Fix
- [x] 7. Update initSchema() to also run migrations (including 002_add_overall_risk_to_scans.sql)
- [x] 8. Add startup log confirming schema applied
- [x] 9. Ensure schema.sql has overall_risk column in scans table (already present)

## Implementation Details
- Use: const userId = req.user?.id ?? req.user?.userId ?? req.user?.sub ?? null;
- Ensure INSERT includes: user_id, image_path, ocr_text, product_category, overall_risk
- Use RETURNING id to get the inserted scan ID
- Log dbError: message, code, detail, constraint
- Include saveError in response when saved=false

