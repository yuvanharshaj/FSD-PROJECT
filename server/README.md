# SmartPark Backend Server

REST API for the SmartPark Smart Parking Reservation and Management System. Built with Node.js, Express, MongoDB (Mongoose), JWT authentication, role-based access control, and node-cron.

---

## 5-Step Quick Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local or MongoDB Atlas URI. **Zero-Setup Supported:** If MongoDB is not installed or unreachable, the server automatically starts an in-memory database (`mongodb-memory-server`) and auto-seeds on start!

### 2. Install Dependencies
From the repository root or the `server` directory:
```bash
cd server
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=supersecret_smartpark_jwt_key_2026
JWT_EXPIRES_IN=7d
```
*(Leave `MONGO_URI` blank to run completely zero-setup in memory!)*

### 4. Seed Database (Optional for In-Memory)
Populate default admin, users, Bengaluru parking lots, slots, and bookings:
```bash
npm run seed
```
> **Default Credentials:**
> - **Admin:** `admin@smartpark.com` / `Admin@123`
> - **User:** `user@smartpark.com` / `User@123`

### 5. Start the Server & Run Smoke Test
Run the development server with live reload:
```bash
npm run dev
# or
npm start
```
Run the automated end-to-end smoke test suite:
```bash
npm run test:smoke
```

---

## Key Features
- **Zero-Setup DB**: Automatically launches an in-memory MongoDB instance with auto-seeding if no external database is configured.
- **Role-Based Auth**: Secure JWT tokens with `user` and `admin` roles, bcrypt password hashing, and strict authorization gates.
- **Booking Rules Engine**:
  - Overlapping booking prevention for slots.
  - Future start time and valid time window enforcement.
  - Daily parking lot operating hours validation.
  - Maximum 12-hour duration limit.
  - Automatic pricing: `ceil(hours) × pricePerHour`.
  - Cancellation rules (owners/admins can cancel only before the booking start time).
- **Background Cron**: Runs every minute with `node-cron` to automatically mark finished bookings as `completed`.
- **Admin Analytics**: Live dashboard metrics for today's revenue, occupancy rate, total bookings, and 7-day revenue/booking history.

