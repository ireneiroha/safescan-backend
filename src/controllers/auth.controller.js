
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.register = async (req, res) => {
  res.json({ message: 'Use /login to authenticate with email only' });
};

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find or create user
    let result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    let userId;
    if (result.rows.length === 0) {
      const insert = await db.query('INSERT INTO users (email) VALUES ($1) RETURNING id', [email]);
      userId = insert.rows[0].id;
    } else {
      userId = result.rows[0].id;
    }

    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: { id: decoded.userId, email: decoded.email } });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
