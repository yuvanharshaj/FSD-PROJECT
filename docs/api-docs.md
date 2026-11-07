# SmartPark API Documentation

Base URL: `http://localhost:5000/api`

---

## Authentication Endpoints

### 1. Register User
- **Method / Route**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Yuvan Harsha",
  "email": "user@smartpark.com",
  "password": "User@123",
  "vehicleNumber": "KA-04-MK-5566"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "672cf1e0819fdf0012ab34cd",
    "name": "Yuvan Harsha",
    "email": "user@smartpark.com",
    "role": "user",
    "vehicleNumber": "KA-04-MK-5566",
    "createdAt": "2026-11-07T10:30:00.000Z"
  }
}
```

### 2. Login User / Admin
- **Method / Route**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@smartpark.com",
  "password": "Admin@123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "672cf1e0819fdf0012ab34ca",
    "name": "SmartPark Admin",
    "email": "admin@smartpark.com",
    "role": "admin",
    "vehicleNumber": "KA-01-AD-1000"
  }
}
```

### 3. Get Current User Profile
- **Method / Route**: `GET /auth/me`
- **Access**: Private (`Bearer <token>`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "user": {
    "_id": "672cf1e0819fdf0012ab34cd",
    "name": "Yuvan Harsha",
    "email": "user@smartpark.com",
    "role": "user",
    "vehicleNumber": "KA-04-MK-5566"
  }
}
```

---

## Parking Lot Endpoints

### 4. Get All Lots
- **Method / Route**: `GET /lots?city=Bengaluru&search=MG`
- **Access**: Public
- **Response** (`200 OK`):
```json
{
  "success": true,
  "count": 4,
  "lots": [
    {
      "_id": "672cf1e0819fdf0012ab34cb",
      "name": "MG Road Central Parking",
      "address": "MG Road, Brigade Road Junction, Ashok Nagar",
      "city": "Bengaluru",
      "lat": 12.9756,
      "lng": 77.6066,
      "totalSlots": 30,
      "pricePerHour": 60,
      "openTime": "06:00",
      "closeTime": "23:00",
      "imageUrl": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a"
    }
  ]
}
```

### 5. Get Lot By ID
- **Method / Route**: `GET /lots/:id`
- **Access**: Public
- **Response** (`200 OK`):
```json
{
  "success": true,
  "lot": {
    "_id": "672cf1e0819fdf0012ab34cb",
    "name": "MG Road Central Parking",
    "address": "MG Road, Brigade Road Junction, Ashok Nagar",
    "city": "Bengaluru",
    "lat": 12.9756,
    "lng": 77.6066,
    "totalSlots": 30,
    "pricePerHour": 60,
    "openTime": "06:00",
    "closeTime": "23:00"
  }
}
```

### 6. Get Slots with Window Availability
- **Method / Route**: `GET /lots/:id/slots?start=2026-11-08T10:00:00.000Z&end=2026-11-08T12:00:00.000Z`
- **Access**: Public
- **Response** (`200 OK`):
```json
{
  "success": true,
  "lot": {
    "id": "672cf1e0819fdf0012ab34cb",
    "name": "MG Road Central Parking",
    "pricePerHour": 60,
    "openTime": "06:00",
    "closeTime": "23:00"
  },
  "timeWindow": {
    "start": "2026-11-08T10:00:00.000Z",
    "end": "2026-11-08T12:00:00.000Z"
  },
  "totalSlots": 30,
  "availableSlotsCount": 29,
  "bookedSlotsCount": 1,
  "slots": [
    {
      "_id": "672cf1e0819fdf0012ab34cf",
      "slotNumber": "M01",
      "type": "car",
      "status": "available",
      "isBooked": false,
      "isAvailable": true
    },
    {
      "_id": "672cf1e0819fdf0012ab34d0",
      "slotNumber": "M02",
      "type": "car",
      "status": "available",
      "isBooked": true,
      "isAvailable": false,
      "bookingInfo": {
        "startTime": "2026-11-08T09:30:00.000Z",
        "endTime": "2026-11-08T11:30:00.000Z",
        "ticketCode": "SPK-4AB91X"
      }
    }
  ]
}
```

### 7. Create Lot (Admin Only)
- **Method / Route**: `POST /lots`
- **Access**: Private (`Admin`)
- **Request Body**:
```json
{
  "name": "HSR Layout Sector 1 Hub",
  "address": "27th Main, Sector 1, HSR Layout",
  "city": "Bengaluru",
  "lat": 12.9116,
  "lng": 77.6534,
  "totalSlots": 20,
  "pricePerHour": 40,
  "openTime": "06:00",
  "closeTime": "23:00"
}
```

### 8. Update / Delete Lot (Admin Only)
- `PUT /lots/:id` - Update lot metadata
- `DELETE /lots/:id` - Delete lot and associated slots

---

## Booking Endpoints

### 9. Create Booking
- **Method / Route**: `POST /bookings`
- **Access**: Private (`User` or `Admin`)
- **Request Body**:
```json
{
  "lotId": "672cf1e0819fdf0012ab34cb",
  "slotId": "672cf1e0819fdf0012ab34cf",
  "vehicleNumber": "KA-04-MK-5566",
  "startTime": "2026-11-08T10:00:00.000Z",
  "endTime": "2026-11-08T12:00:00.000Z"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Booking confirmed successfully!",
  "booking": {
    "_id": "672cf1e0819fdf0012ab34e0",
    "user": {
      "_id": "672cf1e0819fdf0012ab34cd",
      "name": "Yuvan Harsha",
      "email": "user@smartpark.com"
    },
    "lot": {
      "_id": "672cf1e0819fdf0012ab34cb",
      "name": "MG Road Central Parking",
      "address": "MG Road, Brigade Road Junction, Ashok Nagar",
      "city": "Bengaluru",
      "pricePerHour": 60
    },
    "slot": {
      "_id": "672cf1e0819fdf0012ab34cf",
      "slotNumber": "M01",
      "type": "car"
    },
    "vehicleNumber": "KA-04-MK-5566",
    "startTime": "2026-11-08T10:00:00.000Z",
    "endTime": "2026-11-08T12:00:00.000Z",
    "totalAmount": 120,
    "status": "confirmed",
    "ticketCode": "SPK-G8A9Z1"
  }
}
```

### 10. Get My Bookings
- **Method / Route**: `GET /bookings/my`
- **Access**: Private (`User` or `Admin`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "bookings": [
    {
      "_id": "672cf1e0819fdf0012ab34e0",
      "lot": { "name": "MG Road Central Parking", "city": "Bengaluru" },
      "slot": { "slotNumber": "M01", "type": "car" },
      "totalAmount": 120,
      "status": "confirmed",
      "ticketCode": "SPK-G8A9Z1",
      "startTime": "2026-11-08T10:00:00.000Z",
      "endTime": "2026-11-08T12:00:00.000Z"
    }
  ]
}
```

### 11. Cancel Booking
- **Method / Route**: `PATCH /bookings/:id/cancel`
- **Access**: Private (Owner or `Admin`)
- **Condition**: Must be cancelled before `startTime`.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Booking cancelled successfully.",
  "booking": {
    "_id": "672cf1e0819fdf0012ab34e0",
    "status": "cancelled"
  }
}
```

### 12. Get All Bookings (Admin Only)
- **Method / Route**: `GET /bookings?status=confirmed&page=1&limit=20`
- **Access**: Private (`Admin`)

---

## Admin Analytics Endpoints

### 13. Get Dashboard Analytics
- **Method / Route**: `GET /admin/stats`
- **Access**: Private (`Admin`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "stats": {
    "revenueToday": 480,
    "occupancyRate": 1.5,
    "totalBookings": 16,
    "currentlyOccupiedSlots": 2,
    "totalSlots": 130,
    "totalUsers": 3,
    "totalLots": 4,
    "last7DaysBookings": [
      { "date": "2026-11-01", "bookings": 1, "revenue": 180 },
      { "date": "2026-11-02", "bookings": 1, "revenue": 150 },
      { "date": "2026-11-03", "bookings": 1, "revenue": 160 },
      { "date": "2026-11-04", "bookings": 1, "revenue": 105 },
      { "date": "2026-11-05", "bookings": 1, "revenue": 120 },
      { "date": "2026-11-06", "bookings": 1, "revenue": 150 },
      { "date": "2026-11-07", "bookings": 3, "revenue": 380 }
    ]
  }
}
```
