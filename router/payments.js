const express = require('express');
const router = express.Router();

// Process payment
router.post('/process', (req, res) => {
  res.json({ message: 'Process payment route' });
});

// Get payment status
router.get('/status/:id', (req, res) => {
  res.json({ message: `Get payment status for ID: ${req.params.id}` });
});

module.exports = router;