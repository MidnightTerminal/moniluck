const jwt          = require('jsonwebtoken');
const { query }    = require('../config/db');
const { AppError } = require('./errorHandler');

// ─── Protect Middleware ───────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists and is active
    const users = await query(
      'SELECT id, first_name, last_name, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users.length) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    const user = users[0];

    if (!user.is_active) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // 4) Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// ─── Restrict To Middleware ───────────────────────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

// ─── Optional Auth Middleware ─────────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await query(
      'SELECT id, first_name, last_name, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );

    if (users.length) req.user = users[0];
    next();
  } catch {
    next(); // Continue without auth if token invalid
  }
};

module.exports = { protect, restrictTo, optionalAuth };