const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const auth = require('../middilware/auth');

// Admin role check middleware
const checkAdminRole = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};
 router.get('/getAll', productController.getAllProducts);

 router.get('/category/:category', productController.getProductsByCategory);

 router.get('/featured', productController.getFeaturedProducts);

 router.get('/search', productController.searchProducts);

 router.get('/:id', productController.getProductById);

 router.post('/create', auth, checkAdminRole, productController.createProduct);

 router.put('/update:id', auth, checkAdminRole, productController.updateProduct);

 router.delete('/delete:id', auth, checkAdminRole, productController.deleteProduct);

module.exports = router;
