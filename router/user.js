const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile route' });
});

// Update user profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile route' });
});

module.exports = router;