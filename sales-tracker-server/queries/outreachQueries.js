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
    contact_email,
    contact_phone,
    company_name,
    linkedin_url,
    contact_method,
    outreach_date,
    status,
    notes,
    response_notes,
    stage,
    stage_detail,
    ownership,
    current_owner,
    role_consideration,
    job_description_url,
    aligned_sector,
    source,
    job_title,
    job_posting_url,
    experience_level,
    salary_range,
    is_shared,
    shared_date
  } = outreachData;

  const query = `
    INSERT INTO outreach (
      staff_user_id, contact_name, contact_title, contact_email, contact_phone,
      company_name, linkedin_url, contact_method, outreach_date,
      status, notes, response_notes, stage, stage_detail, ownership, current_owner, role_consideration, job_description_url,
      aligned_sector, source, job_title, job_posting_url, experience_level, salary_range, is_shared, shared_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    RETURNING *
  `;

  const values = [
    staff_user_id,
    contact_name,
    contact_title,
    contact_email,
    contact_phone,
    company_name,
    linkedin_url,
    contact_method,
    outreach_date,
    status,
    notes,
    response_notes,
    stage,
    stage_detail || null,
    ownership,
    current_owner || ownership, // Default current_owner to ownership if not provided
    role_consideration,
    job_description_url,
    JSON.stringify(aligned_sector || []), // Store as JSON string
    JSON.stringify(source || []), // Store as JSON string
    job_title || null,
    job_posting_url || null,
    experience_level || null,
    salary_range || null,
    is_shared || false,
    shared_date || null
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
    'contact_name', 'contact_title', 'contact_email', 'contact_phone',
    'company_name', 'linkedin_url', 'contact_method', 'outreach_date',
    'status', 'notes', 'response_notes', 'stage', 'stage_detail',
    'ownership', 'current_owner', 'role_consideration', 'job_description_url',
    'job_title', 'job_posting_url', 'experience_level', 'salary_range', 'is_shared', 'shared_date'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      fields.push(`${field} = $${paramCount}`);
      values.push(updateData[field]);
      paramCount++;
    }
  });

  // Handle aligned_sector separately as it needs JSON stringification
  if (updateData.aligned_sector !== undefined) {
    fields.push(`aligned_sector = $${paramCount}`);
    values.push(JSON.stringify(updateData.aligned_sector));
    paramCount++;
  }

  // Handle source separately as it needs JSON stringification
  if (updateData.source !== undefined) {
    fields.push(`source = $${paramCount}`);
    values.push(JSON.stringify(updateData.source));
    paramCount++;
  }

  // Handle next_steps separately as it needs JSON stringification
  if (updateData.next_steps !== undefined) {
    fields.push(`next_steps = $${paramCount}`);
    // Only stringify if it's not already a string
    values.push(typeof updateData.next_steps === 'string'
      ? updateData.next_steps
      : JSON.stringify(updateData.next_steps));
    paramCount++;
  }

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

