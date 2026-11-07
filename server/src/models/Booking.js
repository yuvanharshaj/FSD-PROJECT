const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking lot reference is required']
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Slot reference is required']
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be positive']
    },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed'
    },
    ticketCode: {
      type: String,
      required: [true, 'Ticket code is required'],
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for conflict checking, user lookups, and fast querying
bookingSchema.index({ slot: 1, status: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

// Serverless-ready: Derive 'completed' status dynamically at serialization time when endTime has elapsed
bookingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.status === 'confirmed' && new Date() >= new Date(obj.endTime)) {
    obj.status = 'completed';
  }
  return obj;
};

module.exports = mongoose.model('Booking', bookingSchema);
