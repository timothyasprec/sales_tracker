const express = require('express');
const router = express.Router();
const {
  getApplicationsByJobPosting,
  getApplicationsByBuilder,
  addBuilderToJobPosting,
  updateApplicationStatus,
  deleteApplication,
  getJobPostingStats
} = require('../queries/jobPostingBuilderQueries');
const auth = require('../middleware/auth');

// Get all applications for a job posting
router.get('/job-posting/:id', auth, async (req, res) => {
  try {
    const applications = await getApplicationsByJobPosting(req.params.id);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications for job posting:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get all applications for a builder
router.get('/builder/:name', auth, async (req, res) => {
  try {
    const applications = await getApplicationsByBuilder(req.params.name);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications for builder:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get statistics for a job posting
router.get('/job-posting/:id/stats', auth, async (req, res) => {
  try {
    const stats = await getJobPostingStats(req.params.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching job posting stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Add builder to job posting (share or apply)
router.post('/', auth, async (req, res) => {
  try {
    const application = await addBuilderToJobPosting(req.body);
    res.status(201).json(application);
  } catch (error) {
    console.error('Error adding builder to job posting:', error);
    res.status(500).json({ error: 'Failed to add builder to job posting' });
  }
});

// Update application status
router.put('/:id', auth, async (req, res) => {
  try {
    const application = await updateApplicationStatus(req.params.id, req.body);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
router.delete('/:id', auth, async (req, res) => {
  try {
    await deleteApplication(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
