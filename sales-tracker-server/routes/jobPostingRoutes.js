const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const auth = require('../middleware/auth');

// GET /api/job-postings - Get all job postings
router.get('/', auth, jobPostingController.getAllJobPostings);

// GET /api/job-postings/:id - Get job posting by ID
router.get('/:id', auth, jobPostingController.getJobPostingById);

// POST /api/job-postings - Create new job posting
router.post('/', auth, jobPostingController.createJobPosting);

// PUT /api/job-postings/:id - Update job posting
router.put('/:id', auth, jobPostingController.updateJobPosting);

// DELETE /api/job-postings/:id - Delete job posting
router.delete('/:id', auth, jobPostingController.deleteJobPosting);

// POST /api/job-postings/:id/builders - Add Builder to job posting
router.post('/:id/builders', auth, jobPostingController.addBuilder);

// GET /api/job-postings/:id/builders - Get Builders for job posting
router.get('/:id/builders', auth, jobPostingController.getBuilders);

module.exports = router;

