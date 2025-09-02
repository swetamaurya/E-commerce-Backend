const express = require('express');
const router = express.Router();

// Get all orders
router.get('/', (req, res) => {
  res.json({ message: 'Get all orders route' });
});

// Create new order
router.post('/', (req, res) => {
  res.json({ message: 'Create new order route' });
});

module.exports = router;