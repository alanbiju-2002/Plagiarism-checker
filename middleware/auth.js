const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    console.log('--- AUTHENTICATED ---');
    console.log('Decoded Token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('--- AUTHENTICATION FAILED ---');
    console.error('Error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('--- AUTHORIZATION FAILED: No user on request ---');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('--- AUTHORIZING ---');
    console.log('User Role:', req.user.role);
    console.log('Allowed Roles:', roles);

    if (!roles.includes(req.user.role)) {
      console.log(`--- AUTHORIZATION FAILED: Role ${req.user.role} not in ${roles} ---`);
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('--- AUTHORIZATION GRANTED ---');
    next();
  };
};

module.exports = { authenticate, authorize };




