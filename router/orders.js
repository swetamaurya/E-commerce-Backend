const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const auth = require('../middilware/auth');

router.get('/', auth, orderController.getOrdersByUser);
router.get('/all', orderController.getAllOrders);
router.get('/:id', auth, orderController.getOrderById);
router.post('/', auth, orderController.createOrder);
router.put('/:id', auth, orderController.updateOrder);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;
