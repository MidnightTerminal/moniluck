const express = require('express');
const router  = express.Router();

const { validateCart, checkStock, placeOrder } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.post('/validate',             validateCart);
router.get('/stock/:product_id',     checkStock);
router.post('/checkout',             protect, placeOrder);

module.exports = router;