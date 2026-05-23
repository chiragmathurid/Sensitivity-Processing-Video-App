const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT — attach user to req so controllers can use it
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token — please log in' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>" → grab just the token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password'); // attach user, strip pw
    next(); // hand off to the next middleware or controller
  } catch (err) {
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