const jwt = require('jsonwebtoken');

/**
 * Optional authentication middleware
 * - If Authorization header missing: calls next() as guest
 * - If Bearer token provided:
 *   - verify JWT using JWT_SECRET
 *   - if valid: set req.user = { id, email } and call next()
 *   - if invalid: DO NOT return 401; just continue as guest (req.user undefined)
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // No token provided - continue as guest
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (e) {
    // Token invalid - continue as guest (do NOT return 401)
    req.user = undefined;
    next();
  }
};

