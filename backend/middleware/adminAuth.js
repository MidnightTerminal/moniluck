const jwt          = require('jsonwebtoken');
const { query }    = require('../config/db');
const { AppError } = require('./errorHandler');

const adminAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Admin authentication required.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await query(
      'SELECT id, first_name, last_name, email, role, is_active FROM users WHERE id = ? AND role = ?',
      [decoded.id, 'admin']
    );

    if (!users.length) {
      return next(new AppError('Access denied. Admin privileges required.', 403));
    }

    if (!users[0].is_active) {
      return next(new AppError('Admin account has been deactivated.', 401));
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid admin token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Admin session expired. Please log in again.', 401));
    }
    next(error);
  }
};

module.exports = adminAuth;