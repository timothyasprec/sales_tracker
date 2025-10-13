const pool = require('../db/dbConfig');

// Get all job postings with optional filters
const getAllJobPostings = async (filters = {}) => {
  let query = `
    SELECT jp.*, u.name as staff_name
    FROM job_postings jp
    LEFT JOIN users u ON jp.staff_user_id = u.id
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  if (filters.staff_user_id) {
    query += ` AND jp.staff_user_id = $${paramCount}`;
    values.push(filters.staff_user_id);
    paramCount++;
  }

  if (filters.status) {
    query += ` AND jp.status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }

  if (filters.company_name) {
    query += ` AND jp.company_name ILIKE $${paramCount}`;
    values.push(`%${filters.company_name}%`);
    paramCount++;
  }

  query += ` ORDER BY jp.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

// Get job posting by ID
const getJobPostingById = async (id) => {
  const query = `
    SELECT jp.*, u.name as staff_name
    FROM job_postings jp
    LEFT JOIN users u ON jp.staff_user_id = u.id
    WHERE jp.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create new job posting
const createJobPosting = async (jobPostingData) => {
  const {
    staff_user_id,
    company_name,
    job_title,
    job_url,
    source,
    outreach_id,
    status,
    description,
    salary_range,
    location,
    notes
  } = jobPostingData;

  const query = `
    INSERT INTO job_postings (
      staff_user_id, company_name, job_title, job_url, source,
      outreach_id, status, description, salary_range, location, notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  const values = [
    staff_user_id,
    company_name,
    job_title,
    job_url,
    source,
    outreach_id,
    status,
    description,
    salary_range,
    location,
    notes
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update job posting
const updateJobPosting = async (id, updateData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Only include fields that are provided
  const allowedFields = [
    'company_name', 'job_title', 'job_url', 'source', 'outreach_id',
    'status', 'description', 'salary_range', 'location', 'notes'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      fields.push(`${field} = $${paramCount}`);
      values.push(updateData[field]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    return await getJobPostingById(id);
  }

  fields.push(`updated_at = NOW()`);
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
  const query = `DELETE FROM job_postings WHERE id = $1`;
  await pool.query(query, [id]);
};

// Add Builder to job posting
const addBuilderToJobPosting = async (builderData) => {
  const { job_posting_id, builder_name, status, notes } = builderData;

  const query = `
    INSERT INTO job_posting_builders (job_posting_id, builder_name, status, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [job_posting_id, builder_name, status, notes];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Builder already associated with this job posting (duplicate)');
    }
    throw error;
  }
};

// Get Builders by job posting ID
const getBuildersByJobPostingId = async (jobPostingId) => {
  const query = `
    SELECT *
    FROM job_posting_builders
    WHERE job_posting_id = $1
    ORDER BY shared_date DESC
  `;
  const result = await pool.query(query, [jobPostingId]);
  return result.rows;
};

module.exports = {
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  addBuilderToJobPosting,
  getBuildersByJobPostingId
};

