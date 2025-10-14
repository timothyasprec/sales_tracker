const activityQueries = require('../queries/activityQueries');

// Get all activities
const getAllActivities = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const activities = await activityQueries.getAllActivities(parseInt(limit), parseInt(offset));
    res.json(activities);
  } catch (error) {
    console.error('Get all activities error:', error);
    res.status(500).json({ error: 'Error fetching activities' });
  }
};

// Create activity log
const createActivity = async (req, res) => {
  try {
    const {
      user_name,
      action_type,
      entity_type,
      entity_name,
      details
    } = req.body;

    if (!user_name || !action_type || !entity_type || !entity_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activityData = {
      user_name,
      action_type,
      entity_type,
      entity_name,
      details
    };

    const newActivity = await activityQueries.createActivity(activityData);
    res.status(201).json({
      message: 'Activity logged successfully',
      activity: newActivity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Error logging activity' });
  }
};

// Get activities by user
const getActivitiesByUser = async (req, res) => {
  try {
    const { user_name } = req.params;
    const activities = await activityQueries.getActivitiesByUser(user_name);
    res.json(activities);
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ error: 'Error fetching user activities' });
  }
};

// Get activity stats
const getActivityStats = async (req, res) => {
  try {
    const stats = await activityQueries.getActivityStats();
    res.json(stats);
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Error fetching activity stats' });
  }
};

module.exports = {
  getAllActivities,
  createActivity,
  getActivitiesByUser,
  getActivityStats
};

