const mongoose = require('mongoose');

let mongoMemoryServer = null;

// Connect to MongoDB or fall back gracefully to in-memory database
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`Could not connect to external MongoDB at ${uri}: ${err.message}`);
      console.log('Falling back to zero-setup in-memory database...');
    }
  } else {
    console.log('No MONGO_URI provided in environment. Using in-memory database...');
  }

  // Fallback to mongodb-memory-server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();

    const conn = await mongoose.connect(memoryUri);
    console.log(`Connected to In-Memory MongoDB: ${memoryUri}`);

    // Auto-seed in-memory database on start
    const seedData = require('../seed');
    await seedData();
    console.log('Auto-seeded in-memory database with initial data.');

    return conn;
  } catch (error) {
    console.error('Failed to initialize in-memory database:', error);
    process.exit(1);
  }
};

// Disconnect Mongoose and stop in-memory server if running
const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };

