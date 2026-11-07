require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('../src/config/db');

const User = require('../src/models/User');
const ParkingLot = require('../src/models/ParkingLot');
const Slot = require('../src/models/Slot');
const Booking = require('../src/models/Booking');

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

// Restore all database collections from JSON backup files
const importRestore = async () => {
  try {
    await connectDB();
    console.log('Connected to database. Restoring collections from /backups...');

    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error(`Backup directory not found at ${BACKUP_DIR}. Please run backup first.`);
    }

    const usersPath = path.join(BACKUP_DIR, 'users.json');
    const lotsPath = path.join(BACKUP_DIR, 'parkinglots.json');
    const slotsPath = path.join(BACKUP_DIR, 'slots.json');
    const bookingsPath = path.join(BACKUP_DIR, 'bookings.json');

    if (!fs.existsSync(usersPath) || !fs.existsSync(lotsPath) || !fs.existsSync(slotsPath)) {
      throw new Error('Required backup files are missing in /backups.');
    }

    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const lots = JSON.parse(fs.readFileSync(lotsPath, 'utf8'));
    const slots = JSON.parse(fs.readFileSync(slotsPath, 'utf8'));
    const bookings = fs.existsSync(bookingsPath) ? JSON.parse(fs.readFileSync(bookingsPath, 'utf8')) : [];

    // Clear existing collections
    await User.deleteMany({});
    await ParkingLot.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});

    // Re-insert backed up data
    if (users.length) await User.insertMany(users);
    if (lots.length) await ParkingLot.insertMany(lots);
    if (slots.length) await Slot.insertMany(slots);
    if (bookings.length) await Booking.insertMany(bookings);

    console.log(`✅ Restore completed successfully!`);
    console.log(`- ${users.length} Users restored`);
    console.log(`- ${lots.length} Parking lots restored`);
    console.log(`- ${slots.length} Slots restored`);
    console.log(`- ${bookings.length} Bookings restored`);

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Restore failed:', err);
    process.exit(1);
  }
};

importRestore();

