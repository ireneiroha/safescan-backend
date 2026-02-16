# TODO: Run SafeScan Backend Project

## Steps to Complete
- [x] Edit src/server.js to add dotenv.config() at the top to load environment variables before app initialization.
- [x] Navigate to safescan-backend-final/ directory.
- [x] Run npm run dev to start the development server.
- [x] Create missing dataset.controller.js to fix module not found error.
- [x] Verify server starts on port 5000 without JWT_SECRET error.
- [x] Test health endpoint: GET /api/health.
- [ ] Test auth endpoints: POST /api/auth/login, POST /api/auth/verify.
- [ ] Confirm protected routes work with/without token.
- [ ] Check for any runtime errors and correct if needed (e.g., DB connection, rate limiting, CORS).
- [ ] Final verification: Server running cleanly, all endpoints responding as expected.
