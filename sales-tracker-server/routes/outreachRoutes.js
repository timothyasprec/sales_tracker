const express = require('express');
const router = express.Router();
const outreachController = require('../controllers/outreachController');
const auth = require('../middleware/auth');

// GET /api/outreach - Get all outreach records
router.get('/', auth, outreachController.getAllOutreach);

// GET /api/outreach/:id - Get outreach by ID
router.get('/:id', auth, outreachController.getOutreachById);

// POST /api/outreach - Create new outreach record
router.post('/', auth, outreachController.createOutreach);

// PUT /api/outreach/:id - Update outreach record
router.put('/:id', auth, outreachController.updateOutreach);

// DELETE /api/outreach/:id - Delete outreach record
router.delete('/:id', auth, outreachController.deleteOutreach);

module.exports = router;

