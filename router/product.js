// router/product.js
const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

// List for cards (only first image)
router.get('/', productController.getProducts);

// Full detail (all images)
router.get('/:id', productController.getProductById);

// (Optional) create
router.post('/', productController.createProduct);

module.exports = router;
