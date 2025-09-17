const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const { auth, authorize } = require('../middilware/auth'); // updated to export both

// ---------------- Public routes (no auth) ----------------
router.get('/getAll', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);



module.exports = router;
