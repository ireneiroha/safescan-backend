# TODO - Production Deployment Updates

## Task: Update Node.js Express backend for production deployment on Render

- [x] Update src/db/index.js with production-ready PostgreSQL configuration
- [x] Update src/server.js to load dotenv only in development
- [x] Verify changes are correct

## Changes Summary:
1. **src/db/index.js**:
   - Remove dotenv require (handled in server.js for dev only)
   - Use DATABASE_URL if present, else use individual PG* vars
   - Add SSL support for production
   - Add proper error logging (error message and code)

2. **src/server.js**:
   - Load dotenv only when NODE_ENV !== 'production'
   - Keep PORT = process.env.PORT || 5000

---

## Task: Add User Registration Feature

- [x] Update src/controllers/auth.controller.js with register function
- [x] Add Swagger documentation for /api/auth/register
- [x] Login functionality unchanged

## Registration Feature Changes:
1. **src/controllers/auth.controller.js**:
   - Email validation (required, format check)
   - Password validation (required, min 6 characters)
   - Check if email already exists
   - Hash password using bcrypt
   - Insert user into database
   - Return 201 with user info (excluding password)
   - Proper error logging

2. **src/docs/openapi.json**:
   - Added /api/auth/register endpoint documentation
   - Request body: email + password
   - Responses: 201 success, 400 validation error, 409 conflict
