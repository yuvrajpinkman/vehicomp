const mongoose = require('mongoose');

const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED'];

const reservationSchema = new mongoose.Schema(
  {
    reservationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle ID is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Rental duration must be at least 1 day'],
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: [0, 'Price per day cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: RESERVATION_STATUSES,
        message: '{VALUE} is not a valid reservation status',
      },
      default: 'CONFIRMED',
      uppercase: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient overlap checking and customer queries
reservationSchema.index({ vehicle: 1, status: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ user: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
module.exports.Reservation = Reservation;
module.exports.RESERVATION_STATUSES = RESERVATION_STATUSES;
