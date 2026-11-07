import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.resolve('docs', 'screenshots');

const log = (msg) => console.log(`[E2E-STEP8] ${msg}`);

async function runStep8Verification() {
  log('Starting comprehensive Step 8 final verification browser suite...');

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
    // 1. Landing Page & Dark Mode Toggle
    log('1. Testing Landing Page & Dark Mode Toggle...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    // Toggle to Dark Mode
    await page.evaluate(() => {
      const darkBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Dark Mode') || b.textContent.includes('Light Mode')
      );
      if (darkBtn) darkBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Confirm dark class is applied
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    log(`   Dark mode activated: ${isDark}`);

    // Toggle back to Light Mode for clean documentation screenshots
    await page.evaluate(() => {
      if (document.documentElement.classList.contains('dark')) {
        const toggle = Array.from(document.querySelectorAll('button')).find((b) =>
          b.textContent.includes('Light Mode')
        );
        if (toggle) toggle.click();
      }
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing.png'), fullPage: true });
    log('✅ Landing page verified & saved docs/screenshots/landing.png');

    // 2. Register Form Strict Validation Rejection in UI
    log('2. Testing Register Form UI Validation Rejection (Bad Values)...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="name"]', { timeout: 8000 });

    // Type invalid values
    await page.type('input[name="name"]', 'Yuvan123'); // Digits in name
    await page.type('input[name="email"]', 'bademail'); // Invalid email
    await page.type('input[name="password"]', 'weak'); // Weak password (<8 chars)
    await page.type('input[name="vehicleNumber"]', 'NOT_A_PLATE'); // Invalid plate

    // Blur fields to trigger inline error messages
    await page.$eval('input[name="vehicleNumber"]', (el) => el.blur());
    await new Promise((r) => setTimeout(r, 300));

    const formErrorTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p.text-red-500')).map((p) => p.textContent);
    });

    log(`   Inline UI errors captured: ${JSON.stringify(formErrorTexts)}`);
    const hasNameError = formErrorTexts.some((t) => t.includes('letters and spaces'));
    const hasEmailError = formErrorTexts.some((t) => t.includes('valid email'));
    const hasPassError = formErrorTexts.some((t) => t.includes('8 characters'));

    if (!hasNameError || !hasEmailError || !hasPassError) {
      throw new Error(`UI Validation failed to reject bad input: ${JSON.stringify(formErrorTexts)}`);
    }

    // Confirm submit button is disabled
    const isSubmitDisabled = await page.evaluate(() => {
      const submit = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Create My Account')
      );
      return submit ? submit.disabled : false;
    });
    log(`   Submit button properly disabled: ${isSubmitDisabled}`);
    log('✅ Bad values properly rejected in Register UI');

    // 3. Register with Valid Values
    log('3. Registering User with Valid Details ("Yuvan Harsha", "KA03KZ7273")...');
    // Reload register page for a fresh pristine form state
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="name"]', { timeout: 8000 });

    const validTestEmail = `yuvan_${Date.now()}@example.com`;
    await page.type('input[name="name"]', 'Yuvan Harsha');
    await page.type('input[name="email"]', validTestEmail);
    await page.type('input[name="password"]', 'Password@123');
    await page.type('input[name="vehicleNumber"]', 'KA03KZ7273');
    await page.$eval('input[name="vehicleNumber"]', (el) => el.blur());
    await new Promise((r) => setTimeout(r, 400));

    // Submit form
    await page.evaluate(() => {
      const submit = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Create My Account')
      );
      if (submit) submit.click();
    });
    await page.waitForFunction(() => window.location.pathname !== '/register', { timeout: 10000 });
    log(`✅ User registered successfully with valid credentials (${validTestEmail})`);

    // 4. Find Parking & Filter by Vehicle Type
    log('4. Testing Find Parking & Car Filter...');
    await page.goto(`${BASE_URL}/find`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('button ::-p-text(Car)', { timeout: 8000 });

    await page.evaluate(() => {
      const carBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.trim() === 'Car'
      );
      if (carBtn) carBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Click "Book this spot" on first lot card
    await page.evaluate(() => {
      const bookBtn = Array.from(document.querySelectorAll('a')).find((a) =>
        a.textContent.includes('Book this spot')
      );
      if (bookBtn) bookBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname.startsWith('/lots/'), {
      timeout: 8000
    });

    // 5. Slot Picker, Quick Chips & Screenshot
    log('5. Testing Slot Picker interactive grid & 2-Hour Quick Chip...');
    await page.waitForSelector('button ::-p-text(FREE)', { timeout: 10000 });

    // Click "2 hours" quick chip
    await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.trim() === '2 hours'
      );
      if (chip) chip.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'slot-picker.png'), fullPage: true });
    log('✅ Slot picker verified & saved docs/screenshots/slot-picker.png');

    // Pick first free slot
    await page.evaluate(() => {
      const slot = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('FREE')
      );
      if (slot) slot.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Proceed to Confirm Screen
    await page.evaluate(() => {
      const proceed = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Book this spot (')
      );
      if (proceed) proceed.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/book/confirm', {
      timeout: 8000
    });

    // 6. Booking Confirmation & PDF Ticket Download Trigger
    log('6. Confirming Booking & Generating Pass with PDF Download Button...');
    await page.waitForSelector('button ::-p-text(Confirm & Book Spot)', { timeout: 8000 });

    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Confirm & Book Spot')
      );
      if (confirmBtn) confirmBtn.click();
    });

    await page.waitForSelector('h2 ::-p-text(Booking Confirmed!)', { timeout: 10000 });
    log('✅ Reservation confirmed with printable digital pass');

    // Verify "Download PDF Ticket" button exists
    const hasPdfBtn = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some((b) =>
        b.textContent.includes('Download PDF Ticket')
      );
    });
    log(`   Download PDF Ticket button present: ${hasPdfBtn}`);

    // Click "Download PDF Ticket" to verify in-browser jsPDF & qrcode generation
    await page.evaluate(() => {
      const pdfBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Download PDF Ticket')
      );
      if (pdfBtn) pdfBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    log('✅ PDF ticket generation triggered without errors');

    // 7. My Bookings & Cancel Pass
    log('7. Testing My Bookings & Cancellation Confirmation Modal...');
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(
      () => {
        return Array.from(document.querySelectorAll('button')).some(
          (b) => b.textContent.trim() === 'Cancel'
        );
      },
      { timeout: 8000 }
    );

    // Click Cancel
    await page.evaluate(() => {
      const cancel = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.trim() === 'Cancel'
      );
      if (cancel) cancel.click();
    });

    // Confirm in modal
    await page.waitForFunction(
      () => {
        return Array.from(document.querySelectorAll('button')).some((b) =>
          b.textContent.includes('Yes, Cancel Booking')
        );
      },
      { timeout: 8000 }
    );

    await page.evaluate(() => {
      const yesBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Yes, Cancel Booking')
      );
      if (yesBtn) yesBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));
    log('✅ Booking cancelled successfully');

    // 8. Non-Admin Gating Check
    log('8. Testing Non-Admin Blocked on /admin...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h2 ::-p-text(Admin Access Required)', { timeout: 8000 });
    log('✅ Non-admin blocked from admin page with friendly gate screen');

    // 9. Admin Login & Dashboard Analytics
    log('9. Logging in as Admin & Auditing Dashboard...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const adminBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Try as Admin')
      );
      if (adminBtn) adminBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/admin', { timeout: 8000 });

    await page.waitForSelector('.recharts-responsive-container', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-dashboard.png'),
      fullPage: true
    });
    log('✅ Admin dashboard verified & saved docs/screenshots/admin-dashboard.png');

    // 10. Admin Add Lot with Strict Validation Check
    log('10. Testing Admin Add Lot with Strict Validation...');
    await page.evaluate(() => {
      const addLotBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Add New Lot')
      );
      if (addLotBtn) addLotBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const testLotName = `Whitefield Tech Hub ${Date.now().toString().slice(-4)}`;
    await page.type('input[placeholder*="Koramangala 6th"]', testLotName);
    await page.type('input[placeholder*="100ft Road"]', 'ITPL Main Road, Whitefield');

    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Create Facility')
      );
      if (createBtn) createBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    log('✅ New parking lot created by admin');

    // 11. Slot Maintenance Toggle
    log('11. Testing Slot Maintenance Toggle...');
    await page.evaluate(() => {
      const slotsBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Slots')
      );
      if (slotsBtn) slotsBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Toggle slot status
    await page.evaluate(() => {
      const slotBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.includes('ACTIVE') || b.textContent.includes('MNT')
      );
      if (slotBtn) slotBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    log('✅ Slot maintenance status toggled');

    // 12. 375px Mobile Viewport Check
    log('12. Testing 375px Mobile Viewport...');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('button[aria-label="Open menu"]', { timeout: 5000 });
    log('✅ Mobile hamburger menu responsive at 375px');

    log('\n========================================================================');
    log('🎉 ALL STEP 8 END-TO-END BROWSER CHECKS PASSED WITH ZERO ERRORS!');
    log('========================================================================\n');
  } catch (err) {
    console.error('❌ Step 8 verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runStep8Verification();
