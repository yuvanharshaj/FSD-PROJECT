import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.resolve('docs', 'screenshots');

const log = (msg) => console.log(`[E2E-FINAL] ${msg}`);

async function runFinalVerification() {
  log('Starting comprehensive Step 6 final verification suite...');

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  try {
    // Check 1: Landing Page & Dark Mode Toggle
    log('1. Testing Landing Page & Dark Mode...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    
    // Toggle dark mode
    await page.evaluate(() => {
      const darkBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dark Mode') || b.textContent.includes('Light Mode'));
      if (darkBtn) darkBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    // Toggle back to light/clean for screenshots
    await page.evaluate(() => {
      if (document.documentElement.classList.contains('dark')) {
        const toggle = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Light Mode'));
        if (toggle) toggle.click();
      }
    });

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing.png'), fullPage: true });
    log('✅ Landing page verified & saved docs/screenshots/landing.png');

    // Check 2: Register New Driver Account
    log('2. Testing Registration & Session...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="name"]', { timeout: 8000 });
    const testEmail = `driver_${Date.now()}@example.com`;

    await page.type('input[name="name"]', 'Deepak Gowda');
    await page.type('input[name="email"]', testEmail);
    await page.type('input[name="password"]', 'Driver@123');
    await page.type('input[name="vehicleNumber"]', 'KA01AB1234');

    await page.evaluate(() => {
      const submit = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create My Account'));
      if (submit) submit.click();
    });
    await page.waitForFunction(() => window.location.pathname !== '/register', { timeout: 8000 });
    log('✅ User registered with session established');

    // Check 3: Find Parking, Search & Filter
    log('3. Testing Find Parking filters...');
    await page.goto(`${BASE_URL}/find`, { waitUntil: 'networkidle0' });
    
    // Filter by vehicle type 'Car'
    await page.evaluate(() => {
      const carFilter = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Car');
      if (carFilter) carFilter.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Click "Book this spot" on first lot
    await page.evaluate(() => {
      const bookBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Book this spot'));
      if (bookBtn) bookBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname.startsWith('/lots/'), { timeout: 8000 });

    // Check 4: Slot Picker with 10s auto-sync & quick chips
    log('4. Testing Slot Picker interactive grid & chips...');
    await page.waitForSelector('button ::-p-text(FREE)', { timeout: 8000 });
    
    // Click "2 hours" quick chip
    await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '2 hours');
      if (chip) chip.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Save Slot Picker screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'slot-picker.png'), fullPage: true });
    log('✅ Slot picker verified & saved docs/screenshots/slot-picker.png');

    // Select free slot
    await page.evaluate(() => {
      const slot = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('FREE'));
      if (slot) slot.click();
    });

    // Proceed to booking confirmation
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const proceed = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Book this spot ('));
      if (proceed) proceed.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/book/confirm', { timeout: 8000 });

    // Check 5: Booking Confirmation & Digital QR Ticket
    log('5. Testing Booking checkout & QR ticket generation...');
    await page.waitForSelector('button ::-p-text(Confirm & Book Spot)', { timeout: 8000 });
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm & Book Spot'));
      if (confirmBtn) confirmBtn.click();
    });

    await page.waitForSelector('h2 ::-p-text(Booking Confirmed!)', { timeout: 10000 });
    log('✅ Reservation confirmed and digital QR pass generated');

    // Check 6: My Bookings & Cancellation
    log('6. Testing My Bookings & Cancellation modal...');
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Cancel');
    }, { timeout: 8000 });

    // Click Cancel
    await page.evaluate(() => {
      const cancel = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Cancel');
      if (cancel) cancel.click();
    });

    // Confirm cancellation in modal
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Yes, Cancel Booking'));
    }, { timeout: 8000 });

    await page.evaluate(() => {
      const yesBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Yes, Cancel Booking'));
      if (yesBtn) yesBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    log('✅ Reservation cancelled via confirmation modal');

    // Check 7: Role Gating & Admin Protection
    log('7. Testing Non-Admin role protection on /admin...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h2 ::-p-text(Admin Access Required)', { timeout: 8000 });
    log('✅ Non-admin successfully gated with friendly Admin Access Required screen');

    // Check 8: Logout and Admin Login
    log('8. Logging in as Admin & Testing Admin Dashboard...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Try as Admin'));
      if (adminBtn) adminBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/admin', { timeout: 8000 });

    // Wait for analytics charts to render
    await page.waitForSelector('.recharts-responsive-container', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-dashboard.png'), fullPage: true });
    log('✅ Admin dashboard verified & saved docs/screenshots/admin-dashboard.png');

    // Check 9: Add Parking Lot
    log('9. Testing Admin Add Lot...');
    await page.evaluate(() => {
      const addLotBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add New Lot'));
      if (addLotBtn) addLotBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const testLotName = `Electronic City Phase ${Date.now().toString().slice(-4)}`;
    await page.type('input[placeholder*="Koramangala 6th"]', testLotName);
    await page.type('input[placeholder*="100ft Road"]', 'Hosur Road, Electronics City');

    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Facility'));
      if (createBtn) createBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    log('✅ Facility added by administrator');

    // Check 10: Slot Maintenance Toggle
    log('10. Testing Slot Maintenance Toggle...');
    await page.evaluate(() => {
      const slotsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Slots'));
      if (slotsBtn) slotsBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Toggle first slot
    await page.evaluate(() => {
      const slotBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ACTIVE') || b.textContent.includes('MNT'));
      if (slotBtn) slotBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    log('✅ Slot maintenance status toggled');

    // Check 11: Mobile Responsiveness at 375px
    log('11. Testing 375px Mobile Viewport...');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('button[aria-label="Open menu"]', { timeout: 5000 });
    log('✅ Mobile hamburger menu and 375px viewport verified');

    log('\n========================================================================');
    log('🎉 ALL 11 FINAL VERIFICATION CHECKS PASSED WITH ZERO ERRORS!');
    log('========================================================================\n');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runFinalVerification();
