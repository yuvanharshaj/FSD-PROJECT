const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateBooking } = require('../middleware/validators');

const router = express.Router();

// Route: Get user's personal bookings (User/Admin)
router.get('/my', authenticate, getMyBookings);

// Route: Get all platform bookings (Admin only)
router.get('/', authenticate, authorize('admin'), getAllBookings);

// Route: Create a new booking (Authenticated users)
router.post(
  '/',
  authenticate,
  validateCreateBooking,
  createBooking
);

// Route: Cancel booking before start time (Owner or Admin)
router.patch('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
