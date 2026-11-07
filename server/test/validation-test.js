const http = require('http');
const app = require('../src/app');

// Automated validation and hardening verification suite
async function runValidationTests() {
  console.log('==============================================');
  console.log(' Starting SmartPark Strict Validation Tests   ');
  console.log('==============================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let total = 0;

  const assert = (condition, description) => {
    total++;
    if (condition) {
      console.log(`✅ PASSED: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${description}`);
      process.exitCode = 1;
    }
  };

  const makeRequest = async (path, options = {}) => {
    const url = `${baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    // 1. Register with digits in name
    const regDigitsName = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Yuvan123', email: 'test1@example.com', password: 'Password123' }
    });
    assert(
      regDigitsName.status === 400 && regDigitsName.data.message === 'Name can only contain letters and spaces',
      'Register rejects digits in name with clean message'
    );

    // 2. Register with symbols in name (<script>)
    const regScript = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: '<script>alert(1)</script>', email: 'test2@example.com', password: 'Password123' }
    });
    assert(
      regScript.status === 400 && regScript.data.message === 'Name can only contain letters and spaces',
      'Register rejects script injection in name'
    );

    // 3. Register with invalid email
    const regBadEmail = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Yuvan Harsha', email: 'notanemail', password: 'Password123' }
    });
    assert(
      regBadEmail.status === 400 && regBadEmail.data.message === 'Please enter a valid email like name@example.com',
      'Register rejects invalid email format'
    );

    // 4. Register with weak password (<8 chars or no number)
    const regWeakPass = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Yuvan Harsha', email: 'valid@example.com', password: 'password' }
    });
    assert(
      regWeakPass.status === 400 && regWeakPass.data.message === 'Use at least 8 characters with a letter and a number',
      'Register rejects password lacking digits'
    );

    // 5. Register with invalid vehicle plate
    const regBadPlate = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Yuvan Harsha',
        email: 'valid2@example.com',
        password: 'Password123',
        vehicleNumber: 'INVALID_123'
      }
    });
    assert(
      regBadPlate.status === 400 && regBadPlate.data.message === 'Enter a valid vehicle number like KA01AB1234',
      'Register rejects non-Indian vehicle plate'
    );

    // 6. Valid user registration
    const validEmail = `driver_${Date.now()}@example.com`;
    const regValid = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: "Mary-Ann D'Souza",
        email: validEmail,
        password: 'ValidPassword123',
        vehicleNumber: 'KA 03 KZ 7273'
      }
    });
    assert(regValid.status === 201 && regValid.data.token, 'Register succeeds with valid name, email, password & vehicle');
    assert(regValid.data.user.vehicleNumber === 'KA03KZ7273', 'Vehicle plate spaces stripped and uppercased');
    const userToken = regValid.data.token;

    // 7. Duplicate registration returns "This email is already registered"
    const regDuplicate = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Person',
        email: validEmail,
        password: 'ValidPassword123'
      }
    });
    assert(
      regDuplicate.status === 400 && regDuplicate.data.message === 'This email is already registered',
      'Duplicate registration returns "This email is already registered"'
    );

    // 8. Admin Login to test lot validation
    const adminLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@smartpark.com', password: 'Admin@123' }
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin login succeeded');
    const adminToken = adminLogin.data.token;

    // 9. Admin lot creation with openTime after closeTime
    const badLotTimes = await makeRequest('/api/lots', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Night Lot',
        address: 'MG Road',
        city: 'Bengaluru',
        pricePerHour: 50,
        openTime: '22:00',
        closeTime: '06:00',
        lat: 12.97,
        lng: 77.59
      }
    });
    assert(
      badLotTimes.status === 400 && badLotTimes.data.message === 'Opening time must be before closing time',
      'Admin lot creation rejects openTime >= closeTime'
    );

    // 10. Admin lot creation with price out of bounds
    const badLotPrice = await makeRequest('/api/lots', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Fancy Lot',
        address: 'MG Road',
        city: 'Bengaluru',
        pricePerHour: -10,
        openTime: '06:00',
        closeTime: '22:00',
        lat: 12.97,
        lng: 77.59
      }
    });
    assert(
      badLotPrice.status === 400 && badLotPrice.data.message === 'Price per hour must be a whole number between 1 and 10000',
      'Admin lot creation rejects invalid pricePerHour'
    );

    // 11. Booking with past start time
    const lotsRes = await makeRequest('/api/lots');
    const lot = lotsRes.data.lots[0];
    const slotsRes = await makeRequest(`/api/lots/${lot._id}/slots`);
    const slot = slotsRes.data.slots[0];

    const pastBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        lotId: lot._id,
        slotId: slot._id,
        vehicleNumber: 'KA01AB1234',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString()
      }
    });
    assert(
      pastBooking.status === 400 && pastBooking.data.message.includes('future'),
      'Booking rejects past start time'
    );

    // 12. Successful booking
    const bookingStart = new Date(Date.now() + 3600000); // +1 hour
    const bookingEnd = new Date(Date.now() + 3600000 * 3); // +3 hours
    const goodBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        lotId: lot._id,
        slotId: slot._id,
        vehicleNumber: 'KA03KZ7273',
        startTime: bookingStart.toISOString(),
        endTime: bookingEnd.toISOString()
      }
    });
    assert(
      goodBooking.status === 201 && goodBooking.data.booking.ticketCode,
      'Valid booking created successfully with ticket code'
    );

    // 13. Concurrency check: overlapping booking on same slot returns 409
    const overlapBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        lotId: lot._id,
        slotId: slot._id,
        vehicleNumber: 'DL01AB9999',
        startTime: bookingStart.toISOString(),
        endTime: bookingEnd.toISOString()
      }
    });
    assert(
      overlapBooking.status === 409 && overlapBooking.data.message === 'That spot was just taken, please pick another.',
      'Overlapping booking returns 409 with "That spot was just taken, please pick another."'
    );

    console.log('\n==============================================');
    console.log(` 🎯 Validation Tests Passed: ${passed} / ${total} `);
    console.log('==============================================\n');
  } catch (err) {
    console.error('Validation test error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runValidationTests();
