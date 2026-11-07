const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Route: Get user's personal bookings (User/Admin)
router.get('/my', authenticate, getMyBookings);

// Route: Get all platform bookings (Admin only)
router.get('/', authenticate, authorize('admin'), getAllBookings);

// Route: Create a new booking (Authenticated users)
router.post(
  '/',
  authenticate,
  [
    body('lotId').notEmpty().withMessage('lotId is required'),
    body('slotId').notEmpty().withMessage('slotId is required'),
    body('vehicleNumber').trim().notEmpty().withMessage('vehicleNumber is required'),
    body('startTime').isISO8601().withMessage('Valid ISO startTime is required'),
    body('endTime').isISO8601().withMessage('Valid ISO endTime is required')
  ],
  createBooking
);

// Route: Cancel booking before start time (Owner or Admin)
router.patch('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
