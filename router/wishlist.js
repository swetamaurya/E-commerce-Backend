// router/wishlist.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controller/wishlistController');
const auth = require('../middilware/auth');

// Get user's wishlist
router.get('/', auth, wishlistController.getWishlist);

// Add item to wishlist
router.post('/add', auth, wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/remove/:productId', auth, wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear', auth, wishlistController.clearWishlist);

// Check if item is in wishlist
router.get('/check/:productId', auth, wishlistController.checkWishlistItem);

module.exports = router;