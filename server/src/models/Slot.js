const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking lot reference is required']
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['car', 'bike', 'ev', 'accessible'],
      default: 'car'
    },
    status: {
      type: String,
      enum: ['available', 'maintenance'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure slotNumber is unique per parking lot
slotSchema.index({ lot: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
