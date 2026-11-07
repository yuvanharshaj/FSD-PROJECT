require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

async function testPing() {
  try {
    console.log('Connecting to Atlas cluster...');
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Successfully connected to MongoDB Atlas! Host:', conn.connection.host);
    await conn.connection.db.admin().ping();
    console.log('✅ Admin ping successful!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.log('Atlas ping attempt:', err.message);
    process.exit(1);
  }
}

testPing();
