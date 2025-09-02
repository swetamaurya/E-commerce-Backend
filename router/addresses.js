const express = require('express');
const router = express.Router();

// Get all addresses
router.get('/', (req, res) => {
  res.json({ message: 'Get all addresses route' });
});

// Add new address
router.post('/', (req, res) => {
  res.json({ message: 'Add new address route' });
});

module.exports = router;