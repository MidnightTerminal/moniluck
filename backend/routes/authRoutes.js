const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const {
  register,
  login,
  getMe,
  getMyOrders,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  validateResetToken,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const registerValidation = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be 2–100 characters.'),
  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be 2–100 characters.'),
  body('email')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please enter a valid phone number.'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),
];

// ─── Validation Middleware ────────────────────────────────────────────────────
const validate = require('../middleware/validate');

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post('/register', registerValidation, validate, register);
router.post('/login',    loginValidation,    validate, login);

router.get('/me',         protect, getMe);
router.get('/orders',     protect, getMyOrders);
router.put('/profile',    protect, updateProfile);
router.put('/password',   protect, changePassword);

router.post('/forgot-password',           forgotPasswordValidation, validate, forgotPassword);
router.get('/validate-reset-token/:token',                          validateResetToken);
router.post('/reset-password/:token',     resetPasswordValidation,  validate, resetPassword);

module.exports = router;