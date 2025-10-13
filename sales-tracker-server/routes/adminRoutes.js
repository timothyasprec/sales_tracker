const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/auth');
const userQueries = require('../queries/userQueries');

// GET /api/admin/users - Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await userQueries.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// PUT /api/admin/users/:id/role - Update user role (admin only)
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['staff', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "staff" or "admin"' });
    }

    const updatedUser = await userQueries.updateUser(id, { role });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      message: `User role updated to ${role}`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Error updating user role' });
  }
});

// PUT /api/admin/users/:id/status - Toggle user active status (admin only)
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    const updatedUser = await userQueries.updateUser(id, { is_active });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      message: `User ${is_active ? 'activated' : 'deactivated'}`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Error updating user status' });
  }
});

module.exports = router;

