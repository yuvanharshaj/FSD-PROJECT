const mongoose = require('mongoose');
const User = require('./models/User');
const ParkingLot = require('./models/ParkingLot');
const Slot = require('./models/Slot');
const Booking = require('./models/Booking');

// Generate unique ticket code
const generateTicketCode = () => {
  return 'SPK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Seed database with initial users, lots, slots, and sample bookings
const seedData = async () => {
  console.log('Seeding SmartPark database...');

  // Clear existing collections
  await User.deleteMany({});
  await ParkingLot.deleteMany({});
  await Slot.deleteMany({});
  await Booking.deleteMany({});

  // 1. Create Users
  const adminUser = await User.create({
    name: 'SmartPark Admin',
    email: 'admin@smartpark.com',
    password: 'Admin@123',
    role: 'admin',
    vehicleNumber: 'KA-01-AD-1000'
  });

  const demoUser = await User.create({
    name: 'Demo User',
    email: 'user@smartpark.com',
    password: 'User@123',
    role: 'user',
    vehicleNumber: 'KA-04-MK-5566'
  });

  const priyaUser = await User.create({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'User@123',
    role: 'user',
    vehicleNumber: 'KA-03-AB-1234'
  });

  const rahulUser = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    password: 'User@123',
    role: 'user',
    vehicleNumber: 'KA-05-XY-9876'
  });

  const users = [demoUser, priyaUser, rahulUser];

  // 2. Create 4 Bengaluru Parking Lots
  const lotsData = [
    {
      name: 'MG Road Central Parking',
      address: 'MG Road, Brigade Road Junction, Ashok Nagar',
      city: 'Bengaluru',
      lat: 12.9756,
      lng: 77.6066,
      totalSlots: 30,
      pricePerHour: 60,
      openTime: '06:00',
      closeTime: '23:00',
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Indiranagar 100ft Hub',
      address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      lat: 12.9719,
      lng: 77.6412,
      totalSlots: 25,
      pricePerHour: 50,
      openTime: '07:00',
      closeTime: '23:30',
      imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Koramangala 5th Block Complex',
      address: '80 Feet Road, 5th Block, Koramangala',
      city: 'Bengaluru',
      lat: 12.9352,
      lng: 77.6245,
      totalSlots: 35,
      pricePerHour: 40,
      openTime: '06:30',
      closeTime: '23:00',
      imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Whitefield ITPL Parkade',
      address: 'ITPL Main Road, Pattandur Agrahara, Whitefield',
      city: 'Bengaluru',
      lat: 12.9850,
      lng: 77.7315,
      totalSlots: 40,
      pricePerHour: 35,
      openTime: '05:00',
      closeTime: '23:59',
      imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const createdLots = await ParkingLot.insertMany(lotsData);

  // 3. Create Slots for each lot
  const allSlots = [];
  for (const lot of createdLots) {
    const slotDocs = [];
    const count = lot.totalSlots;
    for (let i = 1; i <= count; i++) {
      let type = 'car';
      if (i > count - 4) {
        type = 'accessible';
      } else if (i > count - 8) {
        type = 'ev';
      } else if (i > count - 14) {
        type = 'bike';
      }

      slotDocs.push({
        lot: lot._id,
        slotNumber: `${lot.name.charAt(0)}${i < 10 ? '0' + i : i}`,
        type,
        status: i === 13 ? 'maintenance' : 'available'
      });
    }
    const inserted = await Slot.insertMany(slotDocs);
    allSlots.push(...inserted);
  }

  // 4. Create 15 Sample Bookings across past, present, and future
  const now = new Date();
  const sampleBookings = [];

  // 8 completed bookings over the last 7 days (good for admin revenue and stats)
  for (let i = 1; i <= 8; i++) {
    const targetUser = users[i % users.length];
    const targetLot = createdLots[i % createdLots.length];
    const targetSlot = allSlots.find(s => s.lot.toString() === targetLot._id.toString() && s.type === 'car');
    
    const startTime = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000));
    const hours = (i % 3) + 2; // 2 to 4 hours
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

    sampleBookings.push({
      user: targetUser._id,
      lot: targetLot._id,
      slot: targetSlot._id,
      vehicleNumber: targetUser.vehicleNumber,
      startTime,
      endTime,
      totalAmount: hours * targetLot.pricePerHour,
      status: 'completed',
      ticketCode: generateTicketCode(),
      createdAt: startTime
    });
  }

  // 2 cancelled bookings
  for (let i = 1; i <= 2; i++) {
    const targetUser = users[i % users.length];
    const targetLot = createdLots[(i + 1) % createdLots.length];
    const targetSlot = allSlots.filter(s => s.lot.toString() === targetLot._id.toString())[i + 5];

    const startTime = new Date(now.getTime() - (i * 12 * 60 * 60 * 1000));
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    sampleBookings.push({
      user: targetUser._id,
      lot: targetLot._id,
      slot: targetSlot._id,
      vehicleNumber: targetUser.vehicleNumber,
      startTime,
      endTime,
      totalAmount: 2 * targetLot.pricePerHour,
      status: 'cancelled',
      ticketCode: generateTicketCode(),
      createdAt: new Date(startTime.getTime() - 60 * 60 * 1000)
    });
  }

  // 2 active confirmed bookings right now (for occupancy stats today)
  for (let i = 0; i < 2; i++) {
    const targetUser = users[i];
    const targetLot = createdLots[0]; // MG Road
    const targetSlot = allSlots.filter(s => s.lot.toString() === targetLot._id.toString())[i + 1];

    const startTime = new Date(now.getTime() - 30 * 60 * 1000); // started 30 mins ago
    const endTime = new Date(now.getTime() + 90 * 60 * 1000); // ends in 90 mins
    const hours = 2;

    sampleBookings.push({
      user: targetUser._id,
      lot: targetLot._id,
      slot: targetSlot._id,
      vehicleNumber: targetUser.vehicleNumber,
      startTime,
      endTime,
      totalAmount: hours * targetLot.pricePerHour,
      status: 'confirmed',
      ticketCode: generateTicketCode(),
      createdAt: startTime
    });
  }

  // 3 upcoming confirmed bookings for tomorrow
  for (let i = 0; i < 3; i++) {
    const targetUser = users[i];
    const targetLot = createdLots[i + 1];
    const targetSlot = allSlots.filter(s => s.lot.toString() === targetLot._id.toString())[i + 2];

    const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000 + (i * 2 * 60 * 60 * 1000));
    const hours = 3;
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

    sampleBookings.push({
      user: targetUser._id,
      lot: targetLot._id,
      slot: targetSlot._id,
      vehicleNumber: targetUser.vehicleNumber,
      startTime,
      endTime,
      totalAmount: hours * targetLot.pricePerHour,
      status: 'confirmed',
      ticketCode: generateTicketCode(),
      createdAt: now
    });
  }

  await Booking.insertMany(sampleBookings);

  console.log(`Seeding complete:`);
  console.log(`- 4 Users (Admin: admin@smartpark.com, Demo: user@smartpark.com)`);
  console.log(`- ${createdLots.length} Parking lots in Bengaluru`);
  console.log(`- ${allSlots.length} Total parking slots`);
  console.log(`- ${sampleBookings.length} Bookings created`);
};

// Execute seeding if run directly from the command line
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, disconnectDB } = require('./config/db');

  (async () => {
    try {
      await connectDB();
      await seedData();
      console.log('Seed command completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Seeding failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = seedData;

