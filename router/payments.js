const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentDetails } = require('../controller/paymentController');
const { authenticateToken } = require('../middilware/auth');

// Create Razorpay order
router.post('/create-order', authenticateToken, createOrder);

// Verify payment
router.post('/verify-payment', authenticateToken, verifyPayment);

// Get payment details
router.get('/payment/:paymentId', authenticateToken, getPaymentDetails);

module.exports = router;