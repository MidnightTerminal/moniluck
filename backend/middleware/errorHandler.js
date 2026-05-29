// ─── Custom Error Class ───────────────────────────────────────────────────────
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status     = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors     = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Not Found Handler ────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // MySQL Duplicate Entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message    = 'A record with this information already exists.';
  }

  // MySQL Foreign Key Constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message    = 'Referenced record does not exist.';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Your session has expired. Please log in again.';
  }

  // Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message    = 'Validation failed.';
  }

  const response = {
    success   : false,
    statusCode,
    message,
  };

  if (err.errors)                                 response.errors = err.errors;
  if (process.env.NODE_ENV === 'development')      response.stack  = err.stack;

  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);

  res.status(statusCode).json(response);
};

module.exports = { AppError, notFound, errorHandler };