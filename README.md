# SmartPark — Smart Parking Reservation and Management System

SmartPark is an end-to-end full stack smart parking solution designed to streamline parking slot discovery, real-time availability tracking, reservation management, and admin oversight for modern urban centers.

---

## Project Structure

```
FSD-PROJECT/
├── client/              # Frontend Web Application (React / Vite) - Stage 2
├── server/              # Backend REST API (Node.js, Express, MongoDB) - Stage 1
│   ├── src/
│   │   ├── config/      # Zero-setup DB connection (MongoDB / MongoMemoryServer)
│   │   ├── controllers/ # Auth, Lot, Booking, and Admin controllers
│   │   ├── cron/        # Cron job to auto-complete expired bookings
│   │   ├── middleware/  # JWT auth, role authorization, central error handler
│   │   ├── models/      # Mongoose schemas: User, ParkingLot, Slot, Booking
│   │   ├── routes/      # Express API route declarations
│   │   ├── app.js       # Express application configuration & security
│   │   ├── server.js    # HTTP server listener
│   │   └── seed.js      # Database seeder (Lots, slots, users, bookings)
│   ├── test/
│   │   └── smoke-test.js# End-to-end API smoke test suite
│   ├── .env.example     # Template for backend environment variables
│   ├── package.json     # Node.js dependencies and scripts
│   └── README.md        # 5-step quick setup guide
├── docs/
│   └── api-docs.md      # REST API endpoints, schema, and sample JSON
├── .gitignore           # Ignored files (node_modules, .env, build, logs)
└── README.md            # Root repository overview
```

---

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM) with zero-setup automatic in-memory fallback (`mongodb-memory-server`)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Security**: Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize, Express-Validator
- **Background Tasks**: node-cron for automated booking status lifecycle transitions

---

## Quick Start (Backend)

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   *(Zero-setup: leave `MONGO_URI` blank to automatically run an in-memory MongoDB with pre-loaded Bengaluru parking lots!)*
4. **Run Smoke Tests**:
   ```bash
   npm run test:smoke
   ```
5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## Seed Accounts

- **Admin Account**: `admin@smartpark.com` / `Admin@123`
- **User Account**: `user@smartpark.com` / `User@123`
- **Bengaluru Lots**: MG Road, Indiranagar, Koramangala, Whitefield (with 130 total slots)

---

## Documentation

Full API documentation and sample request/response payloads are available in [`docs/api-docs.md`](./docs/api-docs.md).
