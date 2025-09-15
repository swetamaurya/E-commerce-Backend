const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const { auth, authorize } = require('../middilware/auth');

// Protect all cart routes for logged-in users (user or admin)
router.use(auth(), authorize(['user','admin']));

 router.get('/', cartController.getCart);

 router.post('/add', cartController.addToCart);

 router.put('/update/:productId', cartController.updateCartItem);


 router.delete('/remove/:productId', cartController.removeFromCart);

 router.delete('/clear', cartController.clearCart);

module.exports = router;
