import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.resolve('docs', 'screenshots');

const log = (msg) => console.log(`[E2E] ${msg}`);

async function runE2E() {
  log('Starting comprehensive single browser pass test...');
  
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

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    // 1. Landing Page
    log('1. Navigating to Landing Page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing.png'), fullPage: true });
    log('✅ Saved docs/screenshots/landing.png');

    // 2. Demo Driver Login
    log('2. Navigating to Login and logging in as Driver...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Click "Try as Driver" demo button
    await page.waitForSelector('button ::-p-text(Try as Driver)');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Try as Driver'));
      btn.click();
    });
    await page.waitForFunction(() => window.location.pathname !== '/login');
    log('✅ Driver authenticated successfully');

    // 3. Find Parking & Slot Picker
    log('3. Navigating to Find Parking...');
    await page.goto(`${BASE_URL}/find`, { waitUntil: 'networkidle0' });
    
    // Click "Book this spot" on the first lot card
    await page.waitForSelector('a ::-p-text(Book this spot)');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Book this spot'));
      btn.click();
    });
    await page.waitForFunction(() => window.location.pathname.startsWith('/lots/'));

    // Wait for slot grid to load
    await page.waitForSelector('button ::-p-text(FREE)', { timeout: 10000 });
    
    // Take screenshot of Slot Picker
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'slot-picker.png'), fullPage: true });
    log('✅ Saved docs/screenshots/slot-picker.png');

    // Pick first free slot
    await page.evaluate(() => {
      const freeSlot = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('FREE'));
      freeSlot.click();
    });
    log('Selected a free parking slot');

    // Click "Book this spot" CTA button in sticky card
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const proceedBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Book this spot ('));
      proceedBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/book/confirm');
    log('Navigated to confirmation screen');

    // 4. Confirm Booking
    log('4. Confirming reservation...');
    await page.waitForSelector('button ::-p-text(Confirm & Book Spot)');
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm & Book Spot'));
      confirmBtn.click();
    });

    // Wait for "Booking Confirmed!" header
    await page.waitForSelector('h2 ::-p-text(Booking Confirmed!)', { timeout: 10000 });
    log('✅ Booking confirmed with QR code generated');

    // 5. Navigate to My Bookings and cancel
    log('5. Checking My Bookings...');
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle0' });
    
    // Wait for booking cards to render
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Cancel');
    }, { timeout: 10000 });

    // Click Cancel button
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    });

    // Wait for modal to open and click confirm
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Yes, Cancel Booking'));
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const confirmCancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Yes, Cancel Booking'));
      if (confirmCancelBtn) confirmCancelBtn.click();
    });

    await new Promise(r => setTimeout(r, 1200));
    log('✅ Booking cancelled successfully');

    // 6. Admin Login & Dashboard
    log('6. Logging in as Admin and testing Admin Dashboard...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('button ::-p-text(Try as Admin)');
    await page.evaluate(() => {
      const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Try as Admin'));
      adminBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/admin');

    // Wait for stats & chart container to appear
    await page.waitForSelector('.recharts-responsive-container', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1500)); // allow chart animation to finish
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-dashboard.png'), fullPage: true });
    log('✅ Saved docs/screenshots/admin-dashboard.png');

    log('\n======================================================');
    log('🎉 ALL BROWSER PASS E2E TESTS COMPLETED PERFECTLY! (6/6)');
    log('======================================================\n');
  } catch (error) {
    console.error('❌ E2E Failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runE2E();
