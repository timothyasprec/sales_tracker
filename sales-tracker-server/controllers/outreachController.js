const outreachQueries = require('../queries/outreachQueries');

// Get all outreach records
const getAllOutreach = async (req, res) => {
  try {
    const { staff_user_id, status, company_name } = req.query;

    // Build filters
    const filters = { status, company_name };
    
    // If a specific staff_user_id is requested, use it
    // Otherwise, admins see all, staff see only their own
    if (staff_user_id) {
      filters.staff_user_id = staff_user_id;
    } else if (req.user.role !== 'admin') {
      filters.staff_user_id = req.user.id;
    }

    const outreach = await outreachQueries.getAllOutreach(filters);

    res.json(outreach);
  } catch (error) {
    console.error('Get all outreach error:', error);
    res.status(500).json({ error: 'Error fetching outreach records' });
  }
};

// Get outreach by ID
const getOutreachById = async (req, res) => {
  try {
    const { id } = req.params;

    const outreach = await outreachQueries.getOutreachById(id);

    if (!outreach) {
      return res.status(404).json({ error: 'Outreach record not found' });
    }

    // Staff can only view their own outreach unless they're admin
    if (req.user.role !== 'admin' && outreach.staff_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(outreach);
  } catch (error) {
    console.error('Get outreach by ID error:', error);
    res.status(500).json({ error: 'Error fetching outreach record' });
  }
};

// Create new outreach record
const createOutreach = async (req, res) => {
  try {
    const {
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
      ownership,
      current_owner,
      source,
      role_consideration,
      job_description_url,
      aligned_sector,
      lead_type,
      job_title,
      job_posting_url,
      experience_level
    } = req.body;

    // Validate required fields
    if (!company_name || !outreach_date) {
      return res.status(400).json({ error: 'Company name and outreach date are required' });
    }

    const outreachData = {
      staff_user_id: req.user.id,
      contact_name,
      contact_title,
      contact_email,
      contact_phone,
      company_name,
      linkedin_url,
      contact_method,
      outreach_date,
      status: status || 'attempted',
      notes,
      response_notes,
      stage,
      ownership,
      current_owner,
      source,
      role_consideration,
      job_description_url,
      aligned_sector,
      job_title,
      job_posting_url,
      experience_level
    };

    const newOutreach = await outreachQueries.createOutreach(outreachData);

    res.status(201).json({
      message: 'Outreach record created successfully',
      outreach: newOutreach
    });
  } catch (error) {
    console.error('Create outreach error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Error creating outreach record' });
  }
};

// Update outreach record
const updateOutreach = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if outreach exists and user has permission
    const existingOutreach = await outreachQueries.getOutreachById(id);
    if (!existingOutreach) {
      return res.status(404).json({ error: 'Outreach record not found' });
    }

    // Staff can only update their own outreach unless they're admin
    if (req.user.role !== 'admin' && existingOutreach.staff_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = { ...req.body };
    delete updateData.staff_user_id; // Prevent changing the owner

    const updatedOutreach = await outreachQueries.updateOutreach(id, updateData);

    res.json({
      message: 'Outreach record updated successfully',
      outreach: updatedOutreach
    });
  } catch (error) {
    console.error('Update outreach error:', error);
    res.status(500).json({ error: 'Error updating outreach record' });
  }
};

// Delete outreach record
const deleteOutreach = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if outreach exists and user has permission
    const existingOutreach = await outreachQueries.getOutreachById(id);
    if (!existingOutreach) {
      return res.status(404).json({ error: 'Outreach record not found' });
    }

    // Staff can only delete their own outreach unless they're admin
    if (req.user.role !== 'admin' && existingOutreach.staff_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await outreachQueries.deleteOutreach(id);

    res.json({ message: 'Outreach record deleted successfully' });
  } catch (error) {
    console.error('Delete outreach error:', error);
    res.status(500).json({ error: 'Error deleting outreach record' });
  }
};

module.exports = {
  getAllOutreach,
  getOutreachById,
  createOutreach,
  updateOutreach,
  deleteOutreach
};

