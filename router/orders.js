const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const sseController = require('../controller/sseController');
 const { auth, authorize } = require('../middilware/auth');

// Protect all order routes for logged-in users (user or admin)
router.use(auth(), authorize(['user','admin']));

// Public routes (no authentication required)
router.get('/all', orderController.getAllOrders);

// User routes (authentication required)
router.get('/', auth(), authorize(['user','admin']), orderController.getOrdersByUser);
router.get('/:id', auth(), authorize(['user','admin']), orderController.getOrderById);
router.post('/', auth(), authorize(['user','admin']), orderController.createOrder);
router.put('/:id', auth(), authorize(['user','admin']), orderController.updateOrder);
router.delete('/:id', auth(), authorize(['user','admin']), orderController.deleteOrder);

// Admin routes (authentication + admin role required)
router.get('/admin/all', auth(), authorize(['admin']), orderController.getAllOrders);
router.get('/admin/stats', auth(), authorize(['admin']), orderController.getOrderStats);
router.get('/admin/:orderId', auth(), authorize(['admin']), orderController.getOrderDetails);
router.put('/admin/:orderId/status', auth(), authorize(['admin']), orderController.updateOrderStatus);

// SSE routes
router.get('/sse-test', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  res.write(`data: ${JSON.stringify({ type: 'test', message: 'SSE test successful' })}\n\n`);
  
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
  }, 5000);
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

router.get('/sse', sseController.orderStatusSSE);

module.exports = router;
