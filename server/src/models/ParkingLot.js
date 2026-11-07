const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parking lot name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    totalSlots: {
      type: Number,
      default: 0
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price must be positive']
    },
    openTime: {
      type: String,
      required: [true, 'Opening time is required (e.g. 06:00)'],
      default: '06:00'
    },
    closeTime: {
      type: String,
      required: [true, 'Closing time is required (e.g. 23:00)'],
      default: '23:00'
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
