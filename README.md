# SmartPark — Smart Parking Reservation and Management System

SmartPark is an end-to-end full stack smart parking solution designed to streamline parking slot discovery, real-time availability tracking, reservation management, and admin oversight for modern urban centers.

---

## Screenshots

| Landing Page | Interactive Slot Picker |
| :---: | :---: |
| ![Landing Page](./docs/screenshots/landing.png) | ![Slot Picker](./docs/screenshots/slot-picker.png) |

| Admin Dashboard & Analytics |
| :---: |
| ![Admin Dashboard](./docs/screenshots/admin-dashboard.png) |

---

## Project Structure

```
FSD-PROJECT/
├── client/              # React (Vite) + Tailwind CSS + Lucide Icons + Recharts
│   ├── src/
│   │   ├── components/  # Navbar, LotCard, SlotGrid, BookingCard, StatCard, Modals
│   │   ├── context/     # AuthContext (JWT + Demo profiles) & ThemeContext (Dark/Light)
│   │   ├── pages/       # Landing, FindParking, LotDetails, BookingConfirm, Admin
│   │   ├── services/    # Axios API client with bearer token interceptor
│   │   ├── App.jsx      # React Router configuration & global layout
│   │   └── main.jsx     # DOM entry point
│   └── package.json     # Client dependencies
├── server/              # Backend REST API (Node.js, Express, MongoDB)
│   ├── src/
│   │   ├── config/      # Zero-setup DB (MongoDB / MongoMemoryServer fallback)
│   │   ├── controllers/ # Auth, Lot, Booking, and Admin controllers
│   │   ├── cron/        # Node-cron job for automated booking lifecycle
│   │   ├── middleware/  # JWT auth, role authorization, central error handler
│   │   ├── models/      # Mongoose schemas: User, ParkingLot, Slot, Booking
│   │   ├── routes/      # Express API route declarations
│   │   ├── app.js       # Express configuration, Helmet, CORS, Rate Limit
│   │   └── seed.js      # Database seeder (4 Bengaluru lots, 130 slots, users, bookings)
│   ├── test/            # End-to-end backend smoke test suite
│   └── package.json
├── docs/
│   ├── api-docs.md      # REST API endpoints, schema, and sample JSON
│   └── screenshots/     # Verified UI screenshots
├── test-e2e.js          # Automated headless browser verification suite
├── package.json         # Root scripts (starts client + server concurrently)
└── .gitignore           # Git ignore rules
```

---

## ⚡ Quick Start (1 Command)

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```
2. **Start Client & Backend Concurrently**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## Demo Credentials (1-Click in UI)

- **Driver Demo:** `user@smartpark.com` / `User@123` *(Click "Try as Driver" on login)*
- **Admin Demo:** `admin@smartpark.com` / `Admin@123` *(Click "Try as Admin" on login)*

---

## Verification & Tests

- **Backend API Smoke Tests:**
  ```bash
  npm run test:smoke
  ```
- **Browser Pass E2E Suite:**
  ```bash
  npm run test:e2e
  ```
