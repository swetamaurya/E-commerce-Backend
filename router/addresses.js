const express = require('express');
const router = express.Router();
const addressController = require('../controller/addressController');
const auth = require('../middilware/auth');

// Get all addresses for user
router.get('/', auth, addressController.getUserAddresses);

// Get default address
router.get('/default', auth, addressController.getDefaultAddress);

// Create new address
router.post('/', auth, addressController.createAddress);

// Update address
router.put('/:id', auth, addressController.updateAddress);

// Delete address
router.delete('/:id', auth, addressController.deleteAddress);

// Set default address
router.patch('/:id/default', auth, addressController.setDefaultAddress);

module.exports = router;