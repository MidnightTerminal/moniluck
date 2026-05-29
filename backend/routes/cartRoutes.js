const express = require('express');
const router  = express.Router();

const { validateCart, checkStock } = require('../controllers/cartController');

router.post('/validate',             validateCart);
router.get('/stock/:product_id',     checkStock);

module.exports = router;