const mongoose = require('mongoose');
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Global cache for serverless environments (e.g. Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connect to MongoDB with connection caching and development in-memory fallback
const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Attempt connection with provided MONGO_URI
  if (uri && uri.trim() !== '') {
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000
      };
      cached.promise = mongoose.connect(uri, opts).then((m) => {
        console.log(`Connected to MongoDB Atlas / Database: ${m.connection.host}`);
        return m;
      });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.error(`MongoDB connection error: ${err.message}`);
      if (isProduction) {
        throw new Error(`Production database connection failed: ${err.message}`);
      }
      console.log('Falling back to local in-memory database for development...');
    }
  } else if (isProduction) {
    throw new Error('MONGO_URI is required in production environments. Please configure it in Vercel settings.');
  }

  // 2. Local development fallback using mongodb-memory-server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!global.__MONGO_MEMORY_SERVER__) {
      global.__MONGO_MEMORY_SERVER__ = await MongoMemoryServer.create();
    }
    const memoryUri = global.__MONGO_MEMORY_SERVER__.getUri();

    cached.promise = mongoose.connect(memoryUri, { bufferCommands: false });
    cached.conn = await cached.promise;
    console.log(`Connected to In-Memory MongoDB: ${memoryUri}`);

    // Auto-seed in-memory database if empty
    const ParkingLot = require('../models/ParkingLot');
    const lotCount = await ParkingLot.countDocuments();
    if (lotCount === 0) {
      const seedData = require('../seed');
      await seedData();
      console.log('Auto-seeded development database with initial records.');
    }

    return cached.conn;
  } catch (error) {
    console.error('Failed to initialize development database:', error);
    throw error;
  }
};

// Disconnect Mongoose and cleanly close memory server if running
const disconnectDB = async () => {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
  if (global.__MONGO_MEMORY_SERVER__) {
    await global.__MONGO_MEMORY_SERVER__.stop();
    global.__MONGO_MEMORY_SERVER__ = null;
  }
};

module.exports = { connectDB, disconnectDB };
