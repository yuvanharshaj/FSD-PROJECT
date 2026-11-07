const cron = require('node-cron');
const Booking = require('../models/Booking');

let cronJob = null;

// Start scheduled cron task to automatically mark expired bookings as completed every minute
const startBookingCron = () => {
  cronJob = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const result = await Booking.updateMany(
        {
          status: 'confirmed',
          endTime: { $lte: now }
        },
        {
          $set: { status: 'completed' }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Cron] Marked ${result.modifiedCount} finished booking(s) as 'completed' at ${now.toISOString()}`);
      }
    } catch (error) {
      console.error('[Cron] Error updating expired bookings:', error.message);
    }
  });

  console.log('[Cron] Booking auto-complete cron job scheduled (runs every minute).');
  return cronJob;
};

// Stop scheduled cron task
const stopBookingCron = () => {
  if (cronJob) {
    cronJob.stop();
  }
};

module.exports = { startBookingCron, stopBookingCron };
