const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT — attach user to req so controllers can use it
exports.protect = async (req, res, next) => {
  let token;

  // Check Authorization header first (used by Axios)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback: check query string (used by <video> src)
  else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'No token — please log in' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Checks user role — use AFTER protect
exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required: ${roles.join(' or ')}`
    });
  }
  next();
};