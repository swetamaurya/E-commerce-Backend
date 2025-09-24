const express = require('express');
const {
  getAllUsers,
  toggleUserBlock,
  deleteUser
} = require('../controller/adminController');
// const adminAuth = require('../middilware/adminAuth');
const router = express.Router();

// Get all users with pagination (admin only)
router.get('/users', getAllUsers);


module.exports = router;
