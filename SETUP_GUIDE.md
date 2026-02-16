# SafeScan Backend - Complete Setup Guide

## Prerequisites
- ✓ Node.js installed
- ✓ Docker installed
- ✓ PowerShell or Command Prompt

---

## Part A: Setup PostgreSQL Database with Docker

### Step 1: Start Docker Desktop
```powershell
# Open Docker Desktop application
# Wait 30 seconds for Docker daemon to start
```

### Step 2: Verify Docker is Running
```powershell
docker ps
```
**Expected:** Should show a table with container info (may be empty)

### Step 3: Stop Any Existing PostgreSQL Containers
```powershell
docker ps -a | findstr postgres
```
**If you see results, stop them:**
```powershell
docker stop postgres_container
docker rm safescan-postgres
```

### Step 4: Start SafeScan PostgreSQL Container
```powershell
docker run --name safescan-postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=safescan `
  -p 5432:5432 `
  -d postgres:latest
```

### Step 5: Verify Database is Running
```powershell
docker ps | findstr safescan-postgres
```
**Expected:** Should show the container running, port 5432

---

## Part B: Setup Backend Environment

### Step 1: Navigate to Project Directory
```powershell
cd "c:\Users\HP ELITEBOOK 840 G3\OneDrive\Desktop\safescan-backend-final-with-swagger\safescan-backend-final"
```

### Step 2: Check .env File Has Database Credentials
```powershell
cat .env
```
**Should contain:**
```
PORT=5000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=safescan
```

**If missing, add these lines to .env file**

### Step 3: Install Dependencies (First Time Only)
```powershell
npm install
```
**Wait for completion** (~2-3 minutes)

### Step 4: Initialize Database Schema
```powershell
npm run db:init
```
**Expected Output:**
```
Initializing database...
Database initialized successfully.
```

---

## Part C: Run the Backend

### Step 1: Start Development Server
```powershell
npm run dev
```

**Expected Output:**
```
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
...
Server running on port 5000
```

### Step 2: Leave This Terminal Running
- Server will auto-reload when you change code
- Press `Ctrl+C` to stop the server

---

## Part D: Verify Everything Works

### In a New PowerShell Terminal:

### Step 1: Test Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET
```

### Step 2: Test Scan API
```powershell
$body = '{"text":"Milk, Eggs, Peanuts"}'
Invoke-WebRequest -Uri "http://localhost:5000/api/scan/analyze" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Step 3: View API Documentation
Open in browser:
```
http://localhost:5000/api/docs
```

---

## Quick Command Summary

**Start Everything (First Time):**
```powershell
# Terminal 1: Start Docker
docker run --name safescan-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=safescan -p 5432:5432 -d postgres:latest

# Terminal 1: Wait 5 seconds

# Terminal 1: Initialize database
cd "c:\Users\HP ELITEBOOK 840 G3\OneDrive\Desktop\safescan-backend-final-with-swagger\safescan-backend-final"
npm install
npm run db:init

# Terminal 1: Start backend
npm run dev
```

**Start Everything (Next Times):**
```powershell
# Terminal 1: Start Docker container
docker start safescan-postgres

# Terminal 1: Start backend
cd "c:\Users\HP ELITEBOOK 840 G3\OneDrive\Desktop\safescan-backend-final-with-swagger\safescan-backend-final"
npm run dev
```

---

## Troubleshooting

**Server won't start:**
- Check port 5000 isn't used: `netstat -ano | findstr :5000`
- Kill process if needed: `taskkill /PID [PID] /F`

**Database won't connect:**
- Check Docker running: `docker ps | findstr safescan-postgres`
- Check .env has correct credentials
- Restart container: `docker restart safescan-postgres`

**Port 5432 already in use:**
```powershell
docker ps -a  # List all containers
docker stop [container_name]  # Stop the one using 5432
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/health | Health check |
| POST | /api/scan/analyze | Analyze ingredients text |
| POST | /api/scan | Upload image for OCR |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | User login |
| GET | /api/user/profile | Get user profile |

---

## Next Steps

1. ✓ Database running
2. ✓ Backend running
3. → Build frontend to connect to these APIs
4. → Test endpoints with frontend

**API Base URL:** `http://localhost:5000/api`
**API Docs:** `http://localhost:5000/api/docs`
