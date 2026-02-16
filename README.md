SafeScan Backend (MVP)

Node.js + Express backend for SafeScan – Product Ingredients Safety Checker.

Project Purpose

SafeScan helps users understand whether the ingredients in personal care or food products are safe, risky, or restricted by scanning product labels and analyzing ingredient lists using OCR and rule-based classification.

Disclaimer: SafeScan provides informational guidance only and is not medical advice.

MVP Features

Upload an image (JPG/PNG) and extract text using Tesseract OCR

Parse extracted text into an ingredient list

Classify each ingredient as Safe / Risky / Restricted / Unknown

Return plain-language explanations and a summary report

Tech Stack

Node.js, Express

Tesseract.js – OCR processing

Multer – image upload handling

Helmet – security headers

Rate limiting – basic API protection

Project Structure
src/
 ├── controllers/
 ├── routes/
 ├── services/
 ├── data/            # ingredient reference list
 ├── utils/
 ├── app.js
 └── server.js
Setup
npm install
copy .env.example .env
npm run dev

Server runs on:

http://localhost:5000
Environment Variables

Example .env:

PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://username:password@localhost:5432/safescan
API Endpoints
Health Check

GET /api/health

Scan Label Image (OCR + Analysis)

POST /api/scan
Content-Type: multipart/form-data

Form field:

image → JPG/PNG file

Example:

curl -X POST http://localhost:5000/api/scan \
  -F "image=@label.jpg"
Analyze Edited Text (No OCR)

POST /api/scan/analyze
Content-Type: application/json

Body:

{
  "text": "Water, Glycerin, Fragrance, Methylparaben"
}

Example:

curl -X POST http://localhost:5000/api/scan/analyze \
  -H "Content-Type: application/json" \
  -d '{ "text": "Water, Glycerin, Fragrance, Methylparaben" }'
Example API Response
{
  "ingredients": [
    { "name": "Glycerin", "status": "Safe" },
    { "name": "Fragrance", "status": "Risky" },
    { "name": "Methylparaben", "status": "Restricted" }
  ],
  "summary": "This product contains 1 risky and 1 restricted ingredient."
}
API Documentation (Swagger)

After starting the server, open:

http://localhost:5000/api/docs
Database (Docker PostgreSQL)
docker run --name safescan-postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=safescan \
  -p 5432:5432 -d postgres:latest

npm run db:init
Notes for the Team

Ingredient reference list: src/data/ingredients.json

Add more real-world ingredients to reduce Unknown results

Keep uploaded images under 5MB and tightly cropped for better OCR accuracy

License

For capstone project purposes.
