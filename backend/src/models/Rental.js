const mongoose = require('mongoose');

const RENTAL_STATUSES = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE'];

const rentalSchema = new mongoose.Schema(
  {
    rentalNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: false,
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
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      required: [true, 'Expected return date is required'],
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
    initialOdometer: {
      type: Number,
      required: true,
      min: [0, 'Initial odometer cannot be negative'],
      default: 0,
    },
    returnOdometer: {
      type: Number,
      min: [0, 'Return odometer cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: RENTAL_STATUSES,
        message: '{VALUE} is not a valid rental status',
      },
      default: 'ACTIVE',
      uppercase: true,
    },
    dailyRate: {
      type: Number,
      required: true,
      min: [0, 'Daily rate cannot be negative'],
    },
    hourlyLateFeeRate: {
      type: Number,
      default: 15, // Default $15 per hour late fee
      min: [0, 'Late fee rate cannot be negative'],
    },
    lateHours: {
      type: Number,
      default: 0,
      min: [0, 'Late hours cannot be negative'],
    },
    lateFee: {
      type: Number,
      default: 0,
      min: [0, 'Late fee cannot be negative'],
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

rentalSchema.index({ user: 1, status: 1 });
rentalSchema.index({ vehicle: 1, status: 1 });

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;
module.exports.Rental = Rental;
module.exports.RENTAL_STATUSES = RENTAL_STATUSES;
