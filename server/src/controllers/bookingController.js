const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');
const Slot = require('../models/Slot');

// Convert HH:MM string to minutes since midnight
const timeStringToMinutes = (timeStr) => {
  const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// Check if a booking window falls within lot operating hours
const checkOperatingHours = (start, end, openTime, closeTime) => {
  const openMin = timeStringToMinutes(openTime);
  const closeMin = timeStringToMinutes(closeTime);

  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();

  if (closeMin >= openMin) {
    // Normal daytime schedule (e.g. 06:00 to 23:00)
    return startMin >= openMin && endMin <= closeMin;
  } else {
    // Overnight operating schedule (e.g. 20:00 to 08:00)
    const isStartValid = startMin >= openMin || startMin <= closeMin;
    const isEndValid = endMin >= openMin || endMin <= closeMin;
    return isStartValid && isEndValid;
  }
};

// Generate a random unique ticket code
const generateTicketCode = () => {
  return 'SPK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new parking booking with validation rules
const createBooking = async (req, res, next) => {
  try {
    const { lotId, slotId, vehicleNumber, startTime, endTime } = req.body;

    if (!lotId || !slotId || !vehicleNumber || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide lotId, slotId, vehicleNumber, startTime, and endTime.'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Rule 1: Start time must be in the future (allowing 1 min leeway for network transit)
    if (start.getTime() < now.getTime() - 60000) {
      return res.status(400).json({
        success: false,
        message: 'Booking start time must be in the future.'
      });
    }

    // Rule 2: End time must be strictly after start time
    if (end.getTime() <= start.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Booking end time must be after start time.'
      });
    }

    // Rule 3: Maximum 12 hours booking duration
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    if (durationHours > 12) {
      return res.status(400).json({
        success: false,
        message: 'Maximum allowed booking duration is 12 hours.'
      });
    }

    // Verify ParkingLot exists
    const lot = await ParkingLot.findById(lotId);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found.'
      });
    }

    // Rule 4: Booking must fall within parking lot operating hours
    const withinHours = checkOperatingHours(start, end, lot.openTime, lot.closeTime);
    if (!withinHours) {
      return res.status(400).json({
        success: false,
        message: `Booking must be within lot operating hours (${lot.openTime} - ${lot.closeTime}).`
      });
    }

    // Verify Slot exists and belongs to this lot
    const slot = await Slot.findById(slotId);
    if (!slot || slot.lot.toString() !== lotId) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found in this lot.'
      });
    }

    if (slot.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Selected slot is currently undergoing maintenance.'
      });
    }

    // Rule 5: Block overlapping bookings on the same slot
    const overlapping = await Booking.findOne({
      slot: slotId,
      status: 'confirmed',
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'Slot is already booked for the selected time window. Please choose another slot or time.'
      });
    }

    // Rule 6: Calculate total amount = hours (rounded up) * pricePerHour
    const totalAmount = durationHours * lot.pricePerHour;

    const booking = await Booking.create({
      user: req.user._id,
      lot: lot._id,
      slot: slot._id,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      startTime: start,
      endTime: end,
      totalAmount,
      status: 'confirmed',
      ticketCode: generateTicketCode()
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('lot', 'name address city pricePerHour')
      .populate('slot', 'slotNumber type')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all bookings belonging to the currently authenticated user
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('lot', 'name address city imageUrl pricePerHour')
      .populate('slot', 'slotNumber type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// Cancel an existing booking before its start time (owner or admin only)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Verify ownership or admin privileges
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking has already been cancelled.'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking.'
      });
    }

    // Booking can only be cancelled before it starts
    const now = new Date();
    if (now >= new Date(booking.startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Bookings cannot be cancelled once they have started or passed.'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all bookings across the platform (Admin only)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, lotId, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (lotId) filter.lot = lotId;

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email vehicleNumber')
        .populate('lot', 'name city')
        .populate('slot', 'slotNumber type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
};
