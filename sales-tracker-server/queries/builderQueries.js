const pool = require('../db/dbConfig');

// Get all builders with optional filters
const getAllBuilders = async (filters = {}) => {
  let query = `
    SELECT b.*, 
           (SELECT COUNT(*) FROM job_posting_builders jpb WHERE jpb.builder_name = b.name) as potential_matches
    FROM builders b
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  if (filters.cohort) {
    query += ` AND b.cohort = $${paramCount}`;
    values.push(filters.cohort);
    paramCount++;
  }

  if (filters.status) {
    query += ` AND b.status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }

  if (filters.role) {
    query += ` AND b.role ILIKE $${paramCount}`;
    values.push(`%${filters.role}%`);
    paramCount++;
  }

  if (filters.search) {
    query += ` AND (b.name ILIKE $${paramCount} OR b.skills ILIKE $${paramCount} OR b.role ILIKE $${paramCount})`;
    values.push(`%${filters.search}%`);
    paramCount++;
  }

  query += ` ORDER BY b.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

// Get builder by ID
const getBuilderById = async (id) => {
  const query = `
    SELECT b.*,
           (SELECT COUNT(*) FROM job_posting_builders jpb WHERE jpb.builder_name = b.name) as potential_matches
    FROM builders b
    WHERE b.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create new builder
const createBuilder = async (builderData) => {
  const {
    name,
    email,
    cohort,
    role,
    skills,
    status,
    bio,
    linkedin_url,
    github_url,
    portfolio_url,
    years_of_experience,
    education,
    university,
    major,
    education_completed,
    date_of_birth,
    aligned_sector,
    sector_alignment_notes
  } = builderData;

  const query = `
    INSERT INTO builders (
      name, email, cohort, role, skills, status, bio,
      linkedin_url, github_url, portfolio_url, years_of_experience,
      education, university, major, education_completed, date_of_birth,
      aligned_sector, sector_alignment_notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `;

  const values = [
    name,
    email,
    cohort,
    role,
    skills,
    status || 'active',
    bio,
    linkedin_url,
    github_url,
    portfolio_url,
    years_of_experience || null,
    education || null,
    university || null,
    major || null,
    education_completed || false,
    date_of_birth || null,
    JSON.stringify(aligned_sector || []),
    sector_alignment_notes || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update builder
const updateBuilder = async (id, updateData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  const allowedFields = [
    'name', 'email', 'cohort', 'role', 'skills', 'status',
    'bio', 'linkedin_url', 'github_url', 'portfolio_url',
    'years_of_experience', 'education', 'university', 'major',
    'education_completed', 'date_of_birth', 'sector_alignment_notes'
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

  if (fields.length === 0) {
    return await getBuilderById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE builders
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete builder
const deleteBuilder = async (id) => {
  const query = `DELETE FROM builders WHERE id = $1`;
  await pool.query(query, [id]);
};

// Get all unique cohorts
const getAllCohorts = async () => {
  const query = `
    SELECT DISTINCT cohort
    FROM builders
    ORDER BY cohort
  `;
  const result = await pool.query(query);
  return result.rows.map(row => row.cohort);
};

module.exports = {
  getAllBuilders,
  getBuilderById,
  createBuilder,
  updateBuilder,
  deleteBuilder,
  getAllCohorts
};

