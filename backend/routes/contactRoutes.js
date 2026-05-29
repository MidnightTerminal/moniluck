const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { sendContactMessage, subscribeNewsletter } = require('../controllers/contactController');
const validate = require('../middleware/validate');

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ min: 3, max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ min: 10, max: 2000 }),
];

const newsletterValidation = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
];

router.post('/',           contactValidation,    validate, sendContactMessage);
router.post('/newsletter', newsletterValidation, validate, subscribeNewsletter);

module.exports = router;