const express = require('express');
const { body } = require('express-validator');
const {
  getLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  getLotSlots,
  toggleSlotMaintenance
} = require('../controllers/lotController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Route: Get all lots (public)
router.get('/', getLots);

// Route: Get single lot details (public)
router.get('/:id', getLotById);

// Route: Get slots for a lot with window availability (public)
router.get('/:id/slots', getLotSlots);

// Route: Create lot (admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createLot
);

// Route: Update lot (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateLot
);

// Route: Delete lot (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteLot
);

// Route: Toggle slot maintenance (admin only)
router.patch(
  '/:id/slots/:slotId/toggle-maintenance',
  authenticate,
  authorize('admin'),
  toggleSlotMaintenance
);

module.exports = router;

