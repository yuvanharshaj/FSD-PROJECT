require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('../src/config/db');

const User = require('../src/models/User');
const ParkingLot = require('../src/models/ParkingLot');
const Slot = require('../src/models/Slot');
const Booking = require('../src/models/Booking');

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

// Export all database collections to JSON backup files
const exportBackup = async () => {
  try {
    await connectDB();
    console.log('Connected to database. Exporting collections to /backups...');

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const [users, lots, slots, bookings] = await Promise.all([
      User.find().select('+password').lean(),
      ParkingLot.find().lean(),
      Slot.find().lean(),
      Booking.find().lean()
    ]);

    fs.writeFileSync(path.join(BACKUP_DIR, 'users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(BACKUP_DIR, 'parkinglots.json'), JSON.stringify(lots, null, 2));
    fs.writeFileSync(path.join(BACKUP_DIR, 'slots.json'), JSON.stringify(slots, null, 2));
    fs.writeFileSync(path.join(BACKUP_DIR, 'bookings.json'), JSON.stringify(bookings, null, 2));

    console.log(`✅ Backup successful!`);
    console.log(`- ${users.length} Users exported to backups/users.json`);
    console.log(`- ${lots.length} Parking lots exported to backups/parkinglots.json`);
    console.log(`- ${slots.length} Slots exported to backups/slots.json`);
    console.log(`- ${bookings.length} Bookings exported to backups/bookings.json`);

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  }
};

exportBackup();
