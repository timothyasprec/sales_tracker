const pool = require('../db/dbConfig');

// Get all job postings
const getAllJobPostings = async () => {
  const query = 'SELECT * FROM job_postings ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

// Get job posting by ID
const getJobPostingById = async (id) => {
  const query = 'SELECT * FROM job_postings WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create new job posting
const createJobPosting = async (jobPostingData) => {
  const {
    job_title,
    company_name,
    job_url,
    experience_level,
    source,
    lead_temperature,
    ownership,
    aligned_sector,
    notes,
    staff_user_id
  } = jobPostingData;

  const query = `
    INSERT INTO job_postings (
      job_title,
      company_name,
      job_url,
      experience_level,
      source,
      lead_temperature,
      ownership,
      aligned_sector,
      notes,
      staff_user_id,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
    RETURNING *
  `;

  const values = [
    job_title,
    company_name,
    job_url || null,
    experience_level || null,
    source || null,
    lead_temperature || 'cold',
    ownership || null,
    aligned_sector ? JSON.stringify(aligned_sector) : null,
    notes || null,
    staff_user_id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update job posting
const updateJobPosting = async (id, updateData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  const allowedFields = [
    'job_title',
    'company_name',
    'job_url',
    'experience_level',
    'source',
    'lead_temperature',
    'ownership',
    'aligned_sector',
    'notes',
    'status'
  ];

  for (const [key, value] of Object.entries(updateData)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(key === 'aligned_sector' && typeof value === 'object' ? JSON.stringify(value) : value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE job_postings
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete job posting
const deleteJobPosting = async (id) => {
  const query = 'DELETE FROM job_postings WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get job postings by ownership
const getJobPostingsByOwnership = async (ownership) => {
  const query = 'SELECT * FROM job_postings WHERE ownership = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [ownership]);
  return result.rows;
};

module.exports = {
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobPostingsByOwnership
};
