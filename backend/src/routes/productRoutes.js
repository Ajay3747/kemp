const express = require('express');
const productController = require('../controllers/productController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Product endpoints
router.post('/create', upload.single('image'), productController.createProduct);
router.get('/all', productController.getAllProducts);
router.get('/seller/:sellerId', productController.getProductsBySeller);
router.get('/:productId', productController.getProduct);
router.put('/:productId', productController.updateProduct);
const { isAuthenticated } = require('../middleware/authMiddleware');
router.delete('/:productId', isAuthenticated, productController.deleteProduct);
router.post('/:productId/review', productController.addReview);

// User profile endpoints
router.get('/profile/:userId', productController.getUserProfile);
router.put('/profile/:userId', productController.updateUserProfile);

module.exports = router;
