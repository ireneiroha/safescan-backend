const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

// JWT Secret validation - defensive check
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return process.env.JWT_SECRET;
};

exports.register = async (req, res) => {
  try {
    const { email, password, consent_given } = req.body;

    // Validate consent is given (POPIA/GDPR requirement)
    if (consent_given !== true) {
      return res.status(400).json({ 
        error: 'You must agree to the SafeScan Privacy Policy and Disclaimer.' 
      });
    }

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    let existingUser;
    try {
      existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    } catch (dbError) {
      console.error('Database query error:', dbError.message);
      console.error('Error code:', dbError.code);
      return res.status(503).json({ error: 'Database connection failed' });
    }

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('Password hashing error:', hashError.message);
      return res.status(500).json({ error: 'Failed to process registration' });
    }

    // Insert new user with consent (POPIA/GDPR compliance)
    let newUser;
    try {
      newUser = await db.query(
        'INSERT INTO users (email, password, consent_given, consent_timestamp) VALUES ($1, $2, $3, NOW()) RETURNING id, email, consent_given, consent_timestamp, created_at',
        [email, hashedPassword, true]
      );
    } catch (dbError) {
      console.error('Database insert error:', dbError.message);
      console.error('Error code:', dbError.code);
      return res.status(503).json({ error: 'Database connection failed' });
    }

    const user = newUser.rows[0];
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        consent_given: user.consent_given,
        consent_timestamp: user.consent_timestamp,
        createdAt: user.created_at
      }
    });
  } catch (e) {
    console.error('Unexpected registration error:', e.message);
    console.error('Stack:', e.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    // Check JWT_SECRET first (defensive)
    let jwtSecret;
    try {
      jwtSecret = getJwtSecret();
    } catch (secretError) {
      console.error('JWT Secret configuration error:', secretError.message);
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const { email, password } = req.body;

    // Validate that both email and password are present
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Query the database for user with the provided email
    let result;
    try {
      result = await db.query('SELECT id, email, password FROM users WHERE email = $1 LIMIT 1', [email]);
    } catch (dbError) {
      console.error('Database query error:', dbError.message);
      console.error('Stack:', dbError.stack);
      return res.status(503).json({ error: 'Database connection failed' });
    }

    // If user is not found, return 401
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password in the database
    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      console.error('Password comparison error:', compareError.message);
      return res.status(500).json({ error: 'Authentication failed' });
    }

    // If password does NOT match, return 401
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Password matches - generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (e) {
    // Handle JWT signing errors
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      console.error('JWT error:', e.message);
      return res.status(500).json({ error: 'Authentication failed' });
    }
    
    // Unexpected errors
    console.error('Unexpected login error:', e.message);
    console.error('Stack:', e.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verify = async (req, res) => {
  try {
    // Check JWT_SECRET first (defensive)
    let jwtSecret;
    try {
      jwtSecret = getJwtSecret();
    } catch (secretError) {
      console.error('JWT Secret configuration error:', secretError.message);
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    res.json({ valid: true, user: { id: decoded.userId, email: decoded.email } });
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Token verification error:', e.message);
    console.error('Stack:', e.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};
