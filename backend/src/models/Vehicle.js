const mongoose = require('mongoose');

const VEHICLE_TYPES = ['HATCHBACK', 'SEDAN', 'SUV', 'LUXURY', 'ELECTRIC'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];
const VEHICLE_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
const VEHICLE_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'RENTED',
  'RETURNED',
  'INSPECTION',
  'DAMAGED',
  'MAINTENANCE',
];

const VehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make/brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: {
        values: VEHICLE_TYPES,
        message: '{VALUE} is not a valid vehicle type',
      },
      uppercase: true,
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel/Energy type is required'],
      enum: {
        values: FUEL_TYPES,
        message: '{VALUE} is not a valid fuel type',
      },
      uppercase: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Daily rental price is required'],
      min: [0, 'Daily price cannot be negative'],
    },
    condition: {
      type: String,
      enum: {
        values: VEHICLE_CONDITIONS,
        message: '{VALUE} is not a valid condition',
      },
      default: 'EXCELLENT',
      uppercase: true,
    },
    status: {
      type: String,
      enum: {
        values: VEHICLE_STATUSES,
        message: '{VALUE} is not a valid vehicle status',
      },
      default: 'AVAILABLE',
      uppercase: true,
    },
    location: {
      city: {
        type: String,
        required: [true, 'City location is required'],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
        default: '',
      },
      coordinates: {
        latitude: { type: Number, default: 17.3850 }, // Default Hyderabad
        longitude: { type: Number, default: 78.4867 },
      },
    },
    seatingCapacity: {
      type: Number,
      default: 5,
      min: [1, 'Seating capacity must be at least 1'],
      max: [20, 'Seating capacity cannot exceed 20'],
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
    features: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    statusChangedAt: {
      type: Date,
      default: Date.now,
    },
    statusHistory: [
      {
        fromStatus: {
          type: String,
          required: true,
        },
        toStatus: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          default: '',
        },
        notes: {
          type: String,
          default: '',
        },
        changedBy: {
          type: String,
          default: 'System',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying and filtering
VehicleSchema.index({ vehicleType: 1, status: 1, isActive: 1 });
VehicleSchema.index({ 'location.city': 1, status: 1 });
VehicleSchema.index({ pricePerDay: 1 });

module.exports = {
  Vehicle: mongoose.model('Vehicle', VehicleSchema),
  VEHICLE_TYPES,
  FUEL_TYPES,
  VEHICLE_CONDITIONS,
  VEHICLE_STATUSES,
};
