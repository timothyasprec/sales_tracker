const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// GET /api/users - Get all users (admin only)
router.get('/', auth, userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', auth, userController.getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', auth, userController.updateUser);

module.exports = router;

