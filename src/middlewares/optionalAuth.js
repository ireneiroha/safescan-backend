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
  
  // DEBUG: Log the authorization header
  console.log('[OptionalAuth] Authorization header:', authHeader);
  
  // No token provided - continue as guest
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    console.log('[OptionalAuth] No valid Bearer token, continuing as guest');
    return next();
  }

  const token = authHeader.substring(7);
  console.log('[OptionalAuth] Token extracted, attempting to verify...');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[OptionalAuth] Token verified successfully, decoded:', decoded);
    // Map userId from JWT to id for req.user
    req.user = { id: decoded.userId, email: decoded.email };
    console.log('[OptionalAuth] req.user set:', req.user);
    next();
  } catch (e) {
    // Token invalid - continue as guest (do NOT return 401)
    console.log('[OptionalAuth] Token verification failed:', e.message);
    req.user = undefined;
    next();
  }
};

