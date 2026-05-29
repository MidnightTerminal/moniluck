const { validationResult } = require('express-validator');
const { AppError }         = require('./errorHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(e => ({
      field  : e.path,
      message: e.msg,
    }));
    return next(new AppError('Validation failed.', 422, formattedErrors));
  }
  next();
};

module.exports = validate;