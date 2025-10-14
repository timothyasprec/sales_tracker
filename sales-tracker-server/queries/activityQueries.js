const pool = require('../db/dbConfig');

// Get all activities with pagination
const getAllActivities = async (limit = 50, offset = 0) => {
  const query = `
    SELECT *
    FROM activities
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Create new activity log
const createActivity = async (activityData) => {
  const {
    user_name,
    action_type,
    entity_type,
    entity_name,
    details
  } = activityData;

  const query = `
    INSERT INTO activities (
      user_name, action_type, entity_type, entity_name, details
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    user_name,
    action_type,
    entity_type,
    entity_name,
    details ? JSON.stringify(details) : null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get activities by user
const getActivitiesByUser = async (user_name) => {
  const query = `
    SELECT *
    FROM activities
    WHERE user_name = $1
    ORDER BY created_at DESC
    LIMIT 20
  `;
  const result = await pool.query(query, [user_name]);
  return result.rows;
};

// Get activity counts by action type
const getActivityStats = async () => {
  const query = `
    SELECT 
      action_type,
      COUNT(*) as count
    FROM activities
    GROUP BY action_type
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getAllActivities,
  createActivity,
  getActivitiesByUser,
  getActivityStats
};

