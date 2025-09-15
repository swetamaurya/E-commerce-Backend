const express = require('express');
const {
  getAllUsers,
  toggleUserBlock,
  deleteUser
} = require('../controller/adminController');
// const adminAuth = require('../middilware/adminAuth');
const router = express.Router();

// Apply admin authentication to all routes
// router.use(adminAuth);

// Get all users with pagination (admin only)
router.get('/users', getAllUsers);

// Block/Unblock user (admin only)
router.put('/users/:userId/block', toggleUserBlock);

// Delete user (admin only)
router.delete('/users/:userId', deleteUser);

module.exports = router;
