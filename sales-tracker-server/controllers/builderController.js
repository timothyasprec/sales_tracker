const builderQueries = require('../queries/builderQueries');

// Get all builders
const getAllBuilders = async (req, res) => {
  try {
    const { cohort, status, role, search } = req.query;
    const filters = { cohort, status, role, search };
    
    const builders = await builderQueries.getAllBuilders(filters);
    res.json(builders);
  } catch (error) {
    console.error('Get all builders error:', error);
    res.status(500).json({ error: 'Error fetching builders' });
  }
};

// Get builder by ID
const getBuilderById = async (req, res) => {
  try {
    const { id } = req.params;
    const builder = await builderQueries.getBuilderById(id);
    
    if (!builder) {
      return res.status(404).json({ error: 'Builder not found' });
    }

    res.json(builder);
  } catch (error) {
    console.error('Get builder by ID error:', error);
    res.status(500).json({ error: 'Error fetching builder' });
  }
};

// Create new builder
const createBuilder = async (req, res) => {
  try {
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
      years_experience,
      education,
      university,
      major,
      education_completed,
      date_of_birth,
      aligned_sector,
      sector_alignment_notes,
      notes,
      next_steps,
      created_date,
      job_search_status,
      offer_company_name,
      initial_salary,
      current_salary,
      offer_date,
      start_date,
      offer_notes
    } = req.body;

    // Validate required fields
    if (!name || !cohort || !email) {
      return res.status(400).json({ error: 'Name, cohort, and email are required' });
    }

    const builderData = {
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
      years_of_experience: years_experience,
      education,
      university,
      major,
      education_completed,
      date_of_birth,
      aligned_sector,
      sector_alignment_notes,
      notes,
      next_steps,
      created_date,
      job_search_status,
      offer_company_name,
      initial_salary,
      current_salary,
      offer_date,
      start_date,
      offer_notes
    };

    const newBuilder = await builderQueries.createBuilder(builderData);

    res.status(201).json({
      message: 'Builder created successfully',
      builder: newBuilder
    });
  } catch (error) {
    console.error('Create builder error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Error creating builder' });
  }
};

// Update builder
const updateBuilder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const updatedBuilder = await builderQueries.updateBuilder(id, updateData);

    if (!updatedBuilder) {
      return res.status(404).json({ error: 'Builder not found' });
    }

    res.json({
      message: 'Builder updated successfully',
      builder: updatedBuilder
    });
  } catch (error) {
    console.error('Update builder error:', error);
    res.status(500).json({ error: 'Error updating builder' });
  }
};

// Delete builder
const deleteBuilder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if builder exists
    const builder = await builderQueries.getBuilderById(id);
    if (!builder) {
      return res.status(404).json({ error: 'Builder not found' });
    }

    await builderQueries.deleteBuilder(id);

    res.json({ message: 'Builder deleted successfully' });
  } catch (error) {
    console.error('Delete builder error:', error);
    res.status(500).json({ error: 'Error deleting builder' });
  }
};

// Get all cohorts
const getAllCohorts = async (req, res) => {
  try {
    const cohorts = await builderQueries.getAllCohorts();
    res.json(cohorts);
  } catch (error) {
    console.error('Get cohorts error:', error);
    res.status(500).json({ error: 'Error fetching cohorts' });
  }
};

module.exports = {
  getAllBuilders,
  getBuilderById,
  createBuilder,
  updateBuilder,
  deleteBuilder,
  getAllCohorts
};

