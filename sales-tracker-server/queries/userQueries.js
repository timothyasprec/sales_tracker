const pool = require('../db/dbConfig');

// Get all users
const getAllUsers = async () => {
  const query = `
    SELECT id, name, email, role, is_active, created_at, updated_at
    FROM users
    ORDER BY name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get user by ID
const getUserById = async (id) => {
  const query = `
    SELECT id, name, email, role, is_active, created_at, updated_at, password
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get user by email
const getUserByEmail = async (email) => {
  const query = `
    SELECT id, name, email, password, role, is_active, created_at, updated_at
    FROM users
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Create new user
const createUser = async (userData) => {
  const { name, email, password, role } = userData;
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, is_active, created_at, updated_at
  `;
  const result = await pool.query(query, [name, email, password, role]);
  return result.rows[0];
};

// Update user
const updateUser = async (id, userData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(userData).forEach(key => {
    if (userData[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(userData[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    return await getUserById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, name, email, role, is_active, created_at, updated_at, password
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser
};

