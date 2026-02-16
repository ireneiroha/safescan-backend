# Quick Reference: Run SafeScan Backend + Database

## 🚀 FIRST TIME SETUP

```powershell
# 1. Start Docker Desktop (wait 30sec)
# 2. Check Docker running
docker ps

# 3. Start PostgreSQL Container
docker run --name safescan-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=safescan -p 5432:5432 -d postgres:latest

# 4. Navigate to project
cd "c:\Users\HP ELITEBOOK 840 G3\OneDrive\Desktop\safescan-backend-final-with-swagger\safescan-backend-final"

# 5. Install dependencies
npm install

# 6. Initialize database
npm run db:init

# 7. Start backend (keep this terminal open)
npm run dev
```

---

## 🔄 EVERY TIME YOU RUN IT

**Terminal 1:**
```powershell
docker start safescan-postgres
```

**Terminal 2:**
```powershell
cd "c:\Users\HP ELITEBOOK 840 G3\OneDrive\Desktop\safescan-backend-final-with-swagger\safescan-backend-final"
npm run dev
```

---

## ✅ VERIFY IT'S WORKING

**In another terminal:**
```powershell
# Test API
Invoke-WebRequest http://localhost:5000/api/health

# Or open in browser
http://localhost:5000/api/docs
```

---

## 📋 KEY PORTS

- **Backend:** `localhost:5000`
- **Database:** `localhost:5432`
- **API Docs:** `http://localhost:5000/api/docs`

---

## 🛑 STOP EVERYTHING

```powershell
# Stop backend (Ctrl+C in the npm run dev terminal)

# Stop database
docker stop safescan-postgres
```

---

## ⚠️ TROUBLESHOOTING

**Docker not installed?**
- Download: https://www.docker.com/products/docker-desktop

**Port 5000 already in use?**
```powershell
netstat -ano | findstr :5000
taskkill /PID [number] /F
```

**PostgreSQL container won't start?**
```powershell
docker rm safescan-postgres
# Then run docker run command again
```

**Database connection error?**
```powershell
# Check .env file has these:
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=safescan
```
