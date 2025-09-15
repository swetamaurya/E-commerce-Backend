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

// ---------------- Admin routes (auth + role) ----------------
// Only admins can list all with admin view (e.g., include inactive, pagination controls, etc.)
router.get('/admin/all', auth(), authorize(['admin']), productController.getAllProducts);

// Create/Update/Delete restricted to admin
router.post('/create', auth(), authorize(['admin']), productController.createProduct);
router.put('/update/:id', auth(), authorize(['admin']), productController.updateProduct);
router.delete('/delete/:id', auth(), authorize(['admin']), productController.deleteProduct);

module.exports = router;
