const express = require('express');
const router = express.Router();
const addressController = require('../controller/addressController');
const { auth, authorize } = require('../middilware/auth'); // same file exporting both

// All address endpoints require login (user or admin)
router.use(auth(), authorize(['user','admin']));

// Get all addresses for current user
router.get('/', addressController.getUserAddresses);

// Get default address
router.get('/default', addressController.getDefaultAddress);

// Create new address
router.post('/', addressController.createAddress);

// Update address (partial updates also supported via PATCH variant if you add it)
router.put('/:id', addressController.updateAddress);

// Delete address
router.delete('/:id', addressController.deleteAddress);

// Set default address (semantic PATCH for partial change)
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
