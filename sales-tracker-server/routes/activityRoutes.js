const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

// GET /api/activities - Get all activities
router.get('/', auth, activityController.getAllActivities);

// GET /api/activities/stats - Get activity stats
router.get('/stats', auth, activityController.getActivityStats);

// GET /api/activities/user/:user_name - Get activities by user
router.get('/user/:user_name', auth, activityController.getActivitiesByUser);

// POST /api/activities - Create new activity
router.post('/', auth, activityController.createActivity);

module.exports = router;

