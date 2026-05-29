const express = require('express');
const router  = express.Router();

const {
  getAllProducts,
  getProduct,
  getFeaturedProducts,
  getCategories,
  getProductsByCategory,
  searchProducts,
  addReview,
} = require('../controllers/productController');

const { protect } = require('../middleware/auth');

router.get('/search',            searchProducts);
router.get('/featured',          getFeaturedProducts);
router.get('/categories',        getCategories);
router.get('/category/:slug',    getProductsByCategory);
router.get('/',                  getAllProducts);
router.get('/:slug',             getProduct);
router.post('/:slug/reviews',    protect, addReview);

module.exports = router;