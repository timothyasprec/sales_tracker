const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const authenticateToken = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET all job postings
router.get('/', jobPostingController.getAllJobPostings);

// GET job posting by ID
router.get('/:id', jobPostingController.getJobPostingById);

// POST create new job posting
router.post('/', jobPostingController.createJobPosting);

// PUT update job posting
router.put('/:id', jobPostingController.updateJobPosting);

// DELETE job posting
router.delete('/:id', jobPostingController.deleteJobPosting);

module.exports = router;
