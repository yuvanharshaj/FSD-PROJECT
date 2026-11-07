require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { startBookingCron, stopBookingCron } = require('./cron/bookingCron');

const PORT = process.env.PORT || 5000;

// Initialize database connection, start cron scheduler, and launch Express server
const startServer = async () => {
  try {
    await connectDB();

    // Start background cron job to auto-complete bookings
    startBookingCron();

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` SmartPark Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(`=========================================`);
    });

    // Gracefully handle process termination
    const gracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      stopBookingCron();
      server.close(async () => {
        await disconnectDB();
        console.log('Server and database connections closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
