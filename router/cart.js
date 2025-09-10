const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const auth = require('../middilware/auth');



router.get('/', auth, cartController.getCart);
router.post('/add', auth, cartController.addToCart);
router.delete('/remove/:productId', auth, cartController.removeFromCart);
router.put('/update/:productId', auth, cartController.updateCartItem);
router.delete('/clear', auth, cartController.clearCart);

module.exports = router;



