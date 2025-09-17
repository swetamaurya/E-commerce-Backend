const express = require('express');
const router = express.Router();
const ImageProxyController = require('../controller/imageProxyController');

// CORS middleware for image routes
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Accept');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Apply CORS to all image routes
router.use(corsMiddleware);

// Image proxy routes (no authentication required)
// Use wildcard pattern to handle URL-encoded external URLs
router.get('/proxy/*', (req, res) => {
  // Extract the filename from the wildcard path
  const filename = req.params[0];
  req.params.filename = filename;
  ImageProxyController.proxyImage(req, res);
});
router.get('/info/*', (req, res) => {
  // Extract the filename from the wildcard path
  const filename = req.params[0];
  req.params.filename = filename;
  ImageProxyController.getImageInfo(req, res);
});
router.get('/health', ImageProxyController.healthCheck);
router.get('/list', ImageProxyController.listImages);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Image Proxy API',
    version: '1.0.0',
    endpoints: {
      proxy: '/api/images/proxy/:filename',
      info: '/api/images/info/:filename',
      health: '/api/images/health',
      list: '/api/images/list'
    },
    usage: {
      example: `${req.protocol}://${req.get('host')}/api/images/proxy/product_123.png`
    }
  });
});

module.exports = router;