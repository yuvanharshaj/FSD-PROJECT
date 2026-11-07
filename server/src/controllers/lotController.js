const ParkingLot = require('../models/ParkingLot');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// Get all parking lots with optional city filter
const getLots = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const filter = {};

    if (city) {
      filter.city = new RegExp(city, 'i');
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    const lots = await ParkingLot.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: lots.length,
      lots
    });
  } catch (error) {
    next(error);
  }
};

// Get a single parking lot by its ID
const getLotById = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    res.status(200).json({
      success: true,
      lot
    });
  } catch (error) {
    next(error);
  }
};

// Create a new parking lot (Admin only)
const createLot = async (req, res, next) => {
  try {
    const {
      name,
      address,
      city,
      lat,
      lng,
      totalSlots = 20,
      pricePerHour,
      openTime = '06:00',
      closeTime = '23:00',
      imageUrl
    } = req.body;

    const lot = await ParkingLot.create({
      name,
      address,
      city,
      lat,
      lng,
      totalSlots,
      pricePerHour,
      openTime,
      closeTime,
      imageUrl
    });

    // Automatically create default slots for the lot
    const slotDocs = [];
    for (let i = 1; i <= totalSlots; i++) {
      let type = 'car';
      if (i > totalSlots - 2) type = 'accessible';
      else if (i > totalSlots - 5) type = 'ev';
      else if (i > totalSlots - 10) type = 'bike';

      slotDocs.push({
        lot: lot._id,
        slotNumber: `${lot.name.charAt(0).toUpperCase() || 'S'}${i < 10 ? '0' + i : i}`,
        type,
        status: 'available'
      });
    }
    await Slot.insertMany(slotDocs);

    res.status(201).json({
      success: true,
      message: 'Parking lot created successfully with slots.',
      lot
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing parking lot (Admin only)
const updateLot = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    res.status(200).json({
      success: true,
      lot
    });
  } catch (error) {
    next(error);
  }
};

// Delete a parking lot and its associated slots (Admin only)
const deleteLot = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    await Slot.deleteMany({ lot: lot._id });
    await lot.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Parking lot and related slots deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get all slots for a parking lot with booked or free status for a given time window
const getLotSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    const lot = await ParkingLot.findById(id);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    // Retrieve all slots for this lot
    const slots = await Slot.find({ lot: id }).sort({ slotNumber: 1 });

    let windowStart;
    let windowEnd;

    if (start && end) {
      windowStart = new Date(start);
      windowEnd = new Date(end);
    } else {
      // Default window: now to 1 hour from now
      windowStart = new Date();
      windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);
    }

    // Find confirmed bookings that overlap the time window
    const overlappingBookings = await Booking.find({
      lot: id,
      status: 'confirmed',
      startTime: { $lt: windowEnd },
      endTime: { $gt: windowStart }
    }).select('slot startTime endTime ticketCode');

    const bookedSlotMap = new Map();
    overlappingBookings.forEach(b => {
      bookedSlotMap.set(b.slot.toString(), b);
    });

    // Augment slots with booking status for this window
    const slotsWithStatus = slots.map(slot => {
      const isBooked = bookedSlotMap.has(slot._id.toString());
      const isMaintenance = slot.status === 'maintenance';
      const isAvailable = !isBooked && !isMaintenance;

      return {
        _id: slot._id,
        lot: slot.lot,
        slotNumber: slot.slotNumber,
        type: slot.type,
        status: slot.status,
        isBooked,
        isAvailable,
        bookingInfo: isBooked ? bookedSlotMap.get(slot._id.toString()) : null
      };
    });

    const availableSlotsCount = slotsWithStatus.filter(s => s.isAvailable).length;

    res.status(200).json({
      success: true,
      lot: {
        id: lot._id,
        name: lot.name,
        pricePerHour: lot.pricePerHour,
        openTime: lot.openTime,
        closeTime: lot.closeTime
      },
      timeWindow: {
        start: windowStart,
        end: windowEnd
      },
      totalSlots: slots.length,
      availableSlotsCount,
      bookedSlotsCount: slotsWithStatus.filter(s => s.isBooked).length,
      slots: slotsWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// Toggle slot maintenance status between available and maintenance (Admin only)
const toggleSlotMaintenance = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    slot.status = slot.status === 'maintenance' ? 'available' : 'maintenance';
    await slot.save();

    res.status(200).json({
      success: true,
      message: `Slot ${slot.slotNumber} is now ${slot.status}.`,
      slot
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  getLotSlots,
  toggleSlotMaintenance
};

