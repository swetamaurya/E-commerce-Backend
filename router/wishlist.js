// router/wishlist.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controller/wishlistController');
const { auth, authorize } = require('../middilware/auth');

// Get user's wishlist
router.get('/', auth(), authorize(['user','admin']), wishlistController.getWishlist);

// Add item to wishlist
router.post('/add', auth(), authorize(['user','admin']), wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/remove/:productId', auth(), authorize(['user','admin']), wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear', auth(), authorize(['user','admin']), wishlistController.clearWishlist);

// Check if item is in wishlist
router.get('/check/:productId', auth(), authorize(['user','admin']), wishlistController.checkWishlistItem);

module.exports = router;