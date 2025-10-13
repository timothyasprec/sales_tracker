const express = require('express');
const router = express.Router();
const builderController = require('../controllers/builderController');
const auth = require('../middleware/auth');

// GET /api/builders - Get all builders
router.get('/', auth, builderController.getAllBuilders);

// GET /api/builders/cohorts - Get all cohorts
router.get('/cohorts', auth, builderController.getAllCohorts);

// GET /api/builders/:id - Get builder by ID
router.get('/:id', auth, builderController.getBuilderById);

// POST /api/builders - Create new builder
router.post('/', auth, builderController.createBuilder);

// PUT /api/builders/:id - Update builder
router.put('/:id', auth, builderController.updateBuilder);

// DELETE /api/builders/:id - Delete builder
router.delete('/:id', auth, builderController.deleteBuilder);

module.exports = router;

