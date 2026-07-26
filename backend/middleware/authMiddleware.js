const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If optional guest auth header is present
    const guestHeader = req.headers['x-guest-token'];
    if (guestHeader) {
      req.isGuest = true;
      req.guestToken = guestHeader;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zyra_luxury_cosmetics_secret_key_2026');
    req.user = decoded;
    req.isGuest = false;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zyra_luxury_cosmetics_secret_key_2026');
      req.user = decoded;
    } catch (e) {
      // Ignore token error for optional auth
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuthMiddleware };
