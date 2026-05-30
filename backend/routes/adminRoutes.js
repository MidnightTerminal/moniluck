const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const adminAuth = require('../middleware/adminAuth');
const { AppError } = require('../middleware/errorHandler');
const admin     = require('../controllers/adminController');

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith('image/')) {
			return cb(null, true);
		}
		cb(new Error('Only image files are allowed.'));
	},
});

// All routes require admin auth
router.use(adminAuth);

// Dashboard
router.get('/dashboard', admin.getDashboard);

// Products
router.get('/products',           admin.getProducts);
router.get('/products/:id',       admin.getProductById);
router.post('/products/upload-image', (req, res, next) => {
	upload.single('image')(req, res, (err) => {
		if (!err) return next();
		if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
			return next(new AppError('Image must be 5MB or smaller.', 400));
		}
		return next(new AppError(err.message || 'Invalid image upload.', 400));
	});
}, admin.uploadProductImage);
router.post('/products',          admin.createProduct);
router.put('/products/:id',       admin.updateProduct);
router.delete('/products/:id',    admin.deleteProduct);
router.patch('/products/:id/toggle', admin.toggleProductStatus);

// Categories
router.get('/categories',         admin.getCategories);
router.post('/categories',        admin.createCategory);
router.put('/categories/:id',     admin.updateCategory);
router.delete('/categories/:id',  admin.deleteCategory);

// Orders
router.get('/orders',             admin.getOrders);
router.get('/orders/:id',         admin.getOrderById);
router.patch('/orders/:id/status', admin.updateOrderStatus);
router.delete('/orders/:id',      admin.deleteOrder);

// Users
router.get('/users',              admin.getUsers);
router.get('/users/:id',          admin.getUserById);
router.put('/users/:id',          admin.updateUser);
router.delete('/users/:id',       admin.deleteUser);

// Reviews
router.get('/reviews',            admin.getReviews);
router.patch('/reviews/:id/approve', admin.approveReview);
router.delete('/reviews/:id',     admin.deleteReview);

// Subscribers
router.get('/subscribers',        admin.getSubscribers);
router.delete('/subscribers/:id', admin.deleteSubscriber);

// Settings
router.get('/settings',           admin.getSettings);
router.put('/settings',           admin.updateSettings);

module.exports = router;