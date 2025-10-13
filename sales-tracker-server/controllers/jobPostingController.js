const jobPostingQueries = require('../queries/jobPostingQueries');

// Get all job postings
const getAllJobPostings = async (req, res) => {
  try {
    const { staff_user_id, status, company_name } = req.query;

    // Staff can only see their own job postings unless they're admin
    let userId = staff_user_id;
    if (req.user.role !== 'admin') {
      userId = req.user.id;
    }

    const filters = { staff_user_id: userId, status, company_name };
    const jobPostings = await jobPostingQueries.getAllJobPostings(filters);

    res.json(jobPostings);
  } catch (error) {
    console.error('Get all job postings error:', error);
    res.status(500).json({ error: 'Error fetching job postings' });
  }
};

// Get job posting by ID
const getJobPostingById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobPosting = await jobPostingQueries.getJobPostingById(id);

    if (!jobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // Staff can only view their own job postings unless they're admin
    if (req.user.role !== 'admin' && jobPosting.staff_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(jobPosting);
  } catch (error) {
    console.error('Get job posting by ID error:', error);
    res.status(500).json({ error: 'Error fetching job posting' });
  }
};

// Create new job posting
const createJobPosting = async (req, res) => {
  try {
    const {
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
    } = req.body;

    // Validate required fields
    if (!company_name || !job_title) {
      return res.status(400).json({ error: 'Company name and job title are required' });
    }

    const jobPostingData = {
      staff_user_id: req.user.id,
      company_name,
      job_title,
      job_url,
      source,
      outreach_id,
      status: status || 'new',
      description,
      salary_range,
      location,
      notes
    };

    const newJobPosting = await jobPostingQueries.createJobPosting(jobPostingData);

    res.status(201).json({
      message: 'Job posting created successfully',
      jobPosting: newJobPosting
    });
  } catch (error) {
    console.error('Create job posting error:', error);
    res.status(500).json({ error: 'Error creating job posting' });
  }
};

// Update job posting
const updateJobPosting = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job posting exists and user has permission
    const existingJobPosting = await jobPostingQueries.getJobPostingById(id);
    if (!existingJobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // Staff can only update their own job postings unless they're admin
    if (req.user.role !== 'admin' && existingJobPosting.staff_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = { ...req.body };
    delete updateData.staff_user_id; // Prevent changing the owner

    const updatedJobPosting = await jobPostingQueries.updateJobPosting(id, updateData);

    res.json({
      message: 'Job posting updated successfully',
      jobPosting: updatedJobPosting
    });
  } catch (error) {
    console.error('Update job posting error:', error);
    res.status(500).json({ error: 'Error updating job posting' });
  }
};

// Delete job posting
const deleteJobPosting = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job posting exists and user has permission
    const existingJobPosting = await jobPostingQueries.getJobPostingById(id);
    if (!existingJobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // Staff can only delete their own job postings unless they're admin
    if (req.user.role !== 'admin' && existingJobPosting.staff_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await jobPostingQueries.deleteJobPosting(id);

    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Delete job posting error:', error);
    res.status(500).json({ error: 'Error deleting job posting' });
  }
};

// Add Builder to job posting
const addBuilder = async (req, res) => {
  try {
    const { id } = req.params;
    const { builder_name, status, notes } = req.body;

    if (!builder_name) {
      return res.status(400).json({ error: 'Builder name is required' });
    }

    // Check if job posting exists
    const jobPosting = await jobPostingQueries.getJobPostingById(id);
    if (!jobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    const builderData = {
      job_posting_id: id,
      builder_name,
      status: status || 'shared',
      notes
    };

    const builder = await jobPostingQueries.addBuilderToJobPosting(builderData);

    res.status(201).json({
      message: 'Builder added to job posting successfully',
      builder
    });
  } catch (error) {
    console.error('Add builder error:', error);
    if (error.message && error.message.includes('duplicate')) {
      res.status(400).json({ error: 'Builder already associated with this job posting' });
    } else {
      res.status(500).json({ error: 'Error adding builder to job posting' });
    }
  }
};

// Get Builders for job posting
const getBuilders = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job posting exists
    const jobPosting = await jobPostingQueries.getJobPostingById(id);
    if (!jobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    const builders = await jobPostingQueries.getBuildersByJobPostingId(id);

    res.json(builders);
  } catch (error) {
    console.error('Get builders error:', error);
    res.status(500).json({ error: 'Error fetching builders' });
  }
};

module.exports = {
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  addBuilder,
  getBuilders
};

