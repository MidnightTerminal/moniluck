const express = require('express');
const router  = express.Router();
const admin   = require('../controllers/adminController');

router.get('/', admin.getPublicSettings);

module.exports = router;