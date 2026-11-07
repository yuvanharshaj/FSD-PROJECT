require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Local development and standalone server entry point
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` SmartPark Server listening on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(`=========================================`);
    });

    // Gracefully handle shutdown
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down cleanly...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Database and server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

