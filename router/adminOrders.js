const express = require('express');
const router = express.Router();
const adminOrderController = require('../controller/adminOrderController');
const sseController = require('../controller/sseController');
const auth = require('../middilware/auth');

// Test SSE endpoint
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

// SSE endpoint for real-time order updates (auth handled in controller)
router.get('/sse', sseController.orderStatusSSE);

// Admin order management routes
router.get('/', auth, adminOrderController.getAllOrders);
router.get('/stats', auth, adminOrderController.getOrderStats);
router.get('/:orderId', auth, adminOrderController.getOrderDetails);
router.put('/:orderId/status', auth, adminOrderController.updateOrderStatus);

module.exports = router;
