const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');
const Slot = require('../models/Slot');
const User = require('../models/User');

// Calculate platform analytics including revenue, occupancy, and last 7 days history
const getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Start and end of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Revenue today: confirmed or completed bookings created today
    const todayBookings = await Booking.find({
      status: { $in: ['confirmed', 'completed'] },
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const revenueToday = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // 2. Occupancy rate: currently active bookings right now vs total slots
    const totalSlotsCount = await Slot.countDocuments({ status: 'available' });
    const currentlyOccupiedSlots = await Booking.countDocuments({
      status: 'confirmed',
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    const occupancyRate = totalSlotsCount > 0
      ? Number(((currentlyOccupiedSlots / totalSlotsCount) * 100).toFixed(1))
      : 0;

    // 3. Total bookings count
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLots = await ParkingLot.countDocuments();

    // 4. Last 7 days breakdown (date, bookings count, revenue)
    const last7DaysBookings = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999);
      const dateStr = dayStart.toISOString().split('T')[0];

      const dayBookings = await Booking.find({
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      last7DaysBookings.push({
        date: dateStr,
        bookings: dayBookings.length,
        revenue: dayRevenue
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        revenueToday,
        occupancyRate,
        totalBookings,
        currentlyOccupiedSlots,
        totalSlots: totalSlotsCount,
        totalUsers,
        totalLots,
        last7DaysBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats
};
