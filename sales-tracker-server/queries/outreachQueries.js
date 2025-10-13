const pool = require('../db/dbConfig');

// Get all outreach records with optional filters
const getAllOutreach = async (filters = {}) => {
  let query = `
    SELECT o.*, u.name as staff_name
    FROM outreach o
    LEFT JOIN users u ON o.staff_user_id = u.id
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  if (filters.staff_user_id) {
    query += ` AND o.staff_user_id = $${paramCount}`;
    values.push(filters.staff_user_id);
    paramCount++;
  }

  if (filters.status) {
    query += ` AND o.status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }

  if (filters.company_name) {
    query += ` AND o.company_name ILIKE $${paramCount}`;
    values.push(`%${filters.company_name}%`);
    paramCount++;
  }

  query += ` ORDER BY o.outreach_date DESC, o.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

// Get outreach by ID
const getOutreachById = async (id) => {
  const query = `
    SELECT o.*, u.name as staff_name
    FROM outreach o
    LEFT JOIN users u ON o.staff_user_id = u.id
    WHERE o.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create new outreach record
const createOutreach = async (outreachData) => {
  const {
    staff_user_id,
    contact_name,
    contact_title,
    company_name,
    linkedin_url,
    contact_method,
    outreach_date,
    status,
    notes,
    response_notes
  } = outreachData;

  const query = `
    INSERT INTO outreach (
      staff_user_id, contact_name, contact_title, company_name,
      linkedin_url, contact_method, outreach_date, status, notes, response_notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    staff_user_id,
    contact_name,
    contact_title,
    company_name,
    linkedin_url,
    contact_method,
    outreach_date,
    status,
    notes,
    response_notes
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update outreach record
const updateOutreach = async (id, updateData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Only include fields that are provided
  const allowedFields = [
    'contact_name', 'contact_title', 'company_name', 'linkedin_url',
    'contact_method', 'outreach_date', 'status', 'notes', 'response_notes'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      fields.push(`${field} = $${paramCount}`);
      values.push(updateData[field]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    return await getOutreachById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE outreach
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete outreach record
const deleteOutreach = async (id) => {
  const query = `DELETE FROM outreach WHERE id = $1`;
  await pool.query(query, [id]);
};

module.exports = {
  getAllOutreach,
  getOutreachById,
  createOutreach,
  updateOutreach,
  deleteOutreach
};

