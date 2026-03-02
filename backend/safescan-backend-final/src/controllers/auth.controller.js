const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

const SALT_ROUNDS = 12;
const TOKEN_TTL = '7d';

function makeToken(userId, email) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const displayName = name?.trim() || email.split('@')[0];

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [email, password_hash, displayName]
    );
    const user = rows[0];
    const token = makeToken(user.id, user.email);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at },
    });
  } catch (e) {
    console.error('[auth] register error:', e.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      // Legacy account created before passwords were enforced — set password now
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user.id]);
    } else {
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const token = makeToken(user.id, user.email);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at },
    });
  } catch (e) {
    console.error('[auth] login error:', e.message);
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
