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
