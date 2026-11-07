const http = require('http');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');

// Helper function to print formatted test step
const logStep = (stepNumber, title) => {
  console.log(`\n[Step ${stepNumber}] ${title}`);
};

// Helper assertion function
const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
};

// Execute complete end-to-end smoke test suite
const runSmokeTest = async () => {
  console.log('==============================================');
  console.log('   Starting SmartPark API Smoke Test Suite    ');
  console.log('==============================================');

  let server;
  let baseUrl;

  try {
    // 1. Connect DB (auto-seeds in memory if no local mongo)
    await connectDB();

    // 2. Start HTTP server on random free port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Test server running at ${baseUrl}`);

    // Test 1: Health check
    logStep(1, 'Health Check Endpoint');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returned HTTP 200');
    assert(healthJson.status === 'healthy', 'Health check reported healthy status');

    // Test 2: Register a new user
    logStep(2, 'Register New User');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke Test User',
        email: testEmail,
        password: 'Password@123',
        vehicleNumber: 'KA-01-TC-9999'
      })
    });
    const regJson = await regRes.json();
    assert(regRes.status === 201, 'User registration returned HTTP 201');
    assert(!!regJson.token, 'Registration returned a JWT token');
    assert(regJson.user.email === testEmail, 'Registered user email matches');
    assert(!regJson.user.password, 'User password is not leaked in registration response');

    // Test 3: Login with registered user
    logStep(3, 'Login with User Credentials');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123'
      })
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200, 'User login returned HTTP 200');
    assert(!!loginJson.token, 'Login returned a valid JWT token');
    assert(!loginJson.user.password, 'User password is not leaked in login response');
    const userToken = loginJson.token;

    // Test 4: Non-admin hitting an admin route (Forbidden check)
    logStep(4, 'Non-Admin Accessing Admin Stats Route (Security Check)');
    const nonAdminRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(nonAdminRes.status === 403, 'Non-admin request rejected with HTTP 403 Forbidden');

    // Test 5: Fetch parking lots and available slots
    logStep(5, 'Fetch Parking Lots & Query Slot Availability');
    const lotsRes = await fetch(`${baseUrl}/api/lots`);
    const lotsJson = await lotsRes.json();
    assert(lotsRes.status === 200, 'Fetched lots successfully');
    assert(lotsJson.lots.length >= 4, 'Seed lots are populated (found 4+ lots)');
    const targetLot = lotsJson.lots[0];

    // Compute future booking times tomorrow between 10:00 and 12:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0, 0);
    const endTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0, 0);

    const slotsRes = await fetch(
      `${baseUrl}/api/lots/${targetLot._id}/slots?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
    );
    const slotsJson = await slotsRes.json();
    assert(slotsRes.status === 200, 'Fetched slots for lot with time window');
    const availableSlot = slotsJson.slots.find(s => s.isAvailable);
    assert(!!availableSlot, 'Found at least one available slot for tomorrow');

    // Test 6: Successful booking creation
    logStep(6, 'Create a Valid Parking Booking');
    const bookRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        lotId: targetLot._id,
        slotId: availableSlot._id,
        vehicleNumber: 'KA-01-TC-9999',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })
    });
    const bookJson = await bookRes.json();
    assert(bookRes.status === 201, 'Booking created successfully with HTTP 201');
    assert(bookJson.booking.status === 'confirmed', 'Booking status is confirmed');
    assert(bookJson.booking.totalAmount === 2 * targetLot.pricePerHour, 'Booking price calculated correctly (2 hrs x price)');
    assert(bookJson.booking.ticketCode.startsWith('SPK-'), 'Ticket code generated in SPK-XXXX format');
    const createdBookingId = bookJson.booking._id;

    // Test 7: Overlapping booking rejection
    logStep(7, 'Overlapping Booking on Same Slot is Rejected (Conflict Check)');
    const overlapRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        lotId: targetLot._id,
        slotId: availableSlot._id,
        vehicleNumber: 'KA-02-ZZ-1111',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })
    });
    const overlapJson = await overlapRes.json();
    assert(overlapRes.status === 409, 'Overlapping booking rejected with HTTP 409 Conflict');
    assert(overlapJson.success === false, 'Error response received for overlap');

    // Test 8: Admin Login & Accessing Admin Stats
    logStep(8, 'Admin Login and Fetch Admin Stats');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@smartpark.com',
        password: 'Admin@123'
      })
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login succeeded');
    const adminToken = adminLoginJson.token;

    const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsJson = await statsRes.json();
    assert(statsRes.status === 200, 'Admin stats returned HTTP 200');
    assert(typeof statsJson.stats.revenueToday === 'number', 'Stats contains revenueToday');
    assert(typeof statsJson.stats.occupancyRate === 'number', 'Stats contains occupancyRate');
    assert(Array.isArray(statsJson.stats.last7DaysBookings), 'Stats contains last7DaysBookings array');
    assert(statsJson.stats.last7DaysBookings.length === 7, 'last7DaysBookings has 7 days of history');

    // Test 9: Get user personal bookings
    logStep(9, 'Get User Bookings (/api/bookings/my)');
    const myBookingsRes = await fetch(`${baseUrl}/api/bookings/my`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const myBookingsJson = await myBookingsRes.json();
    assert(myBookingsRes.status === 200, 'My bookings fetched successfully');
    assert(myBookingsJson.bookings.some(b => b._id === createdBookingId), 'Created booking present in my bookings');

    // Test 10: Cancel booking before start time
    logStep(10, 'Cancel Booking Before Start Time');
    const cancelRes = await fetch(`${baseUrl}/api/bookings/${createdBookingId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const cancelJson = await cancelRes.json();
    assert(cancelRes.status === 200, 'Booking cancelled successfully');
    assert(cancelJson.booking.status === 'cancelled', 'Booking status updated to cancelled');

    console.log('\n==============================================');
    console.log(' 🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY! (10/10)');
    console.log('==============================================\n');
  } catch (err) {
    console.error('\n❌ SMOKE TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    process.exit(process.exitCode || 0);
  }
};

runSmokeTest();
