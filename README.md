<img width="1512" height="860" alt="Screenshot 2026-02-25 at 5 57 47 PM" src="https://github.com/user-attachments/assets/5780a5e4-ce4b-44b8-b4ea-8dd04b6e7d0a" />


# SafeScan

SafeScan is a web application that lets users scan product ingredient labels using their camera or uploaded images, then analyzes each ingredient for safety concerns using AI-powered OCR and a clinical ingredient database.

---

## Features

- **Live Label Scanning** — Point your camera at any ingredient list; OCR reads it instantly
- **Ingredient Safety Analysis** — Each ingredient is flagged as safe, risky, or dangerous
- **Personalized Alerts** — Set your own allergen or sensitivity preferences
- **Deep Ingredient Lookup** — Search over 50,000 cosmetic and food ingredients
- **Scan History** — Review past scans and results
- **Authentication** — Register and sign in to save preferences and history

---

## Tech Stack

**Frontend**
- React 19 + Vite 7
- React Router v7
- Tailwind CSS v4

**Backend**
- Node.js + Express
- PostgreSQL (`pg`)
- Tesseract.js (OCR)
- JWT authentication (`jsonwebtoken` + `bcrypt`)
- Google APIs integration
- Swagger UI for API docs

---

## Project Structure

```
SafeScan/
├── frontend/          # React + Vite client
│   └── src/
│       ├── pages/     # Landing, Scan, OCRReview, Results, History, Settings, Auth
│       ├── components/# UI, layout, camera, ingredients, feedback
│       ├── context/   # AuthContext
│       ├── hooks/     # useCamera, useUpload, useLoading
│       └── routes/    # AppRoutes
│
└── backend/
    └── safescan-backend-final/
        └── src/
            ├── controllers/
            ├── routes/
            ├── services/
            ├── repositories/
            ├── middlewares/
            ├── db/
            └── utils/
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- npm

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

### Backend

```bash
cd backend/safescan-backend-final
npm install
cp .env.example .env   # fill in your environment variables
npm run db:init        # initialize the database
npm run dev
```

Runs on `http://localhost:5000` by default.

### Environment Variables (Backend)

| Variable      | Description                        |
|---------------|------------------------------------|
| `PORT`        | Server port (default: 5000)        |
| `JWT_SECRET`  | Secret key for JWT signing         |
| `CORS_ORIGIN` | Allowed frontend origin            |
| `DATABASE_URL`| PostgreSQL connection string       |

---

## Available Scripts

### Frontend

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

### Backend

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start with nodemon (hot reload) |
| `npm run start`   | Start production server         |
| `npm run db:init` | Initialize database schema      |

---

## Pages

| Route              | Description                        |
|--------------------|------------------------------------|
| `/`                | Landing page                       |
| `/register`        | Sign up                            |
| `/login`           | Sign in                            |
| `/scan-home`       | Scan entry point                   |
| `/lookup`          | Manual ingredient search           |
| `/history`         | Past scan history                  |
| `/scan-result/:id` | Individual scan results            |
| `/settings`        | User preferences                   |
| `/privacy`         | Privacy policy                     |

---

## About                                                                                                                                                                                                                                                                                                                                                                                                  
SafeScan was built as a collaboration project during the **Women Techsters Fellowship** by [Tech4Dev](https://tech4dev.com). The fellowship supports women in technology across Africa, and this project was developed as part of that program.                                                                                                                                                              
                                                                                                                                                                                                              
## Contributions                                                                                                                                                                                                                                                                                                                                                                                                   
  Contributions, ideas, and additions are welcome!                                                                                                                                                          
                                                                                                                                                                                                            
If you'd like to improve SafeScan — whether it's a new feature, a bug fix, better UI, or expanded ingredient data — feel free to get involved:                                                            
                                                                                                                                                                                                      
 1. Fork the repository                                                                                                                                                                                    
 2. Create a new branch (`git checkout -b feature/your-feature-name`)                                                                                                                                      
 3. Commit your changes (`git commit -m 'Add your feature'`)                                                                                                                                               
 4. Push to your branch (`git push origin feature/your-feature-name`)                                                                                                                                      
 5. Open a Pull Request                                                                                                                                                                                                                                                                                                                                                                                     
  +For major changes, please open an issue first to discuss what you'd like to change.                                                                                                                       
 ## License                                                                                                                                                                                                



