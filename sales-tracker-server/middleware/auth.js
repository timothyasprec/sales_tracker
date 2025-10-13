const jwt = require('jsonwebtoken');

// Authentication middleware to verify JWT tokens
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET);
    
    // Add user info to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Admin authorization middleware
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = auth;
module.exports.adminAuth = adminAuth;

