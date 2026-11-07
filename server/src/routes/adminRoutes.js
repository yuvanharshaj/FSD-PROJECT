const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Route: Get dashboard analytics (Admin only)
router.get('/stats', authenticate, authorize('admin'), getAdminStats);

module.exports = router;
