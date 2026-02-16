
require('dotenv').config();
console.log('Environment variables loaded:', { JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set', CORS_ORIGIN: process.env.CORS_ORIGIN ? 'set' : 'not set' });

const app = require('./app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
