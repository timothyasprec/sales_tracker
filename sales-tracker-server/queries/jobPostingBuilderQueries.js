const pool = require('../db/dbConfig');

// Get all applications for a specific job posting
const getApplicationsByJobPosting = async (jobPostingId) => {
  const query = `
    SELECT jpb.*, b.email as builder_email, b.cohort
    FROM job_posting_builders jpb
    LEFT JOIN builders b ON jpb.builder_name = b.name
    WHERE jpb.job_posting_id = $1
    ORDER BY jpb.shared_date DESC, jpb.created_at DESC
  `;
  const result = await pool.query(query, [jobPostingId]);
  return result.rows;
};

// Get all applications for a specific builder
const getApplicationsByBuilder = async (builderName) => {
  const query = `
    SELECT jpb.*, jp.job_title, jp.company_name, jp.experience_level
    FROM job_posting_builders jpb
    INNER JOIN job_postings jp ON jpb.job_posting_id = jp.id
    WHERE jpb.builder_name = $1
    ORDER BY jpb.shared_date DESC, jpb.created_at DESC
  `;
  const result = await pool.query(query, [builderName]);
  return result.rows;
};

// Add a builder to a job posting (share or apply)
const addBuilderToJobPosting = async (data) => {
  const {
    job_posting_id,
    builder_name,
    status = 'Shared',
    shared_date,
    applied_date,
    notes,
    last_updated_by
  } = data;

  const query = `
    INSERT INTO job_posting_builders (
      job_posting_id, builder_name, status, shared_date, applied_date, notes, last_updated_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (job_posting_id, builder_name)
    DO UPDATE SET
      status = EXCLUDED.status,
      applied_date = EXCLUDED.applied_date,
      notes = EXCLUDED.notes,
      last_updated_by = EXCLUDED.last_updated_by,
      updated_at = NOW()
    RETURNING *
  `;

  const values = [
    job_posting_id,
    builder_name,
    status,
    shared_date || new Date().toISOString().split('T')[0],
    applied_date,
    notes,
    last_updated_by
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update application status
const updateApplicationStatus = async (id, data) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  const allowedFields = ['status', 'applied_date', 'notes', 'last_updated_by'];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramCount}`);
      values.push(data[field]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE job_posting_builders
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete an application
const deleteApplication = async (id) => {
  const query = `DELETE FROM job_posting_builders WHERE id = $1`;
  await pool.query(query, [id]);
};

// Get application statistics for a job posting
const getJobPostingStats = async (jobPostingId) => {
  const query = `
    SELECT
      COUNT(*) as total_shared,
      COUNT(CASE WHEN applied_date IS NOT NULL THEN 1 END) as total_applied,
      COUNT(CASE WHEN status = 'Offer' THEN 1 END) as total_offers,
      COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as total_accepted
    FROM job_posting_builders
    WHERE job_posting_id = $1
  `;
  const result = await pool.query(query, [jobPostingId]);
  return result.rows[0];
};

module.exports = {
  getApplicationsByJobPosting,
  getApplicationsByBuilder,
  addBuilderToJobPosting,
  updateApplicationStatus,
  deleteApplication,
  getJobPostingStats
};
