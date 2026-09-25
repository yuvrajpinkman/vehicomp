const mongoose = require('mongoose');

const LOCATION_STATUSES = ['MOVING', 'IDLE', 'PARKED', 'MAINTENANCE', 'OFFLINE'];

const LocationLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    speed: {
      type: Number,
      default: 0,
      min: [0, 'Speed cannot be negative'],
    },
    heading: {
      type: Number,
      default: 0,
      min: [0, 'Heading must be between 0 and 360'],
      max: [360, 'Heading must be between 0 and 360'],
    },
    status: {
      type: String,
      enum: {
        values: LOCATION_STATUSES,
        message: '{VALUE} is not a valid location status',
      },
      default: 'PARKED',
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    fuelLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    odometer: {
      type: Number,
      default: 0,
      min: 0,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

LocationLogSchema.index({ vehicle: 1, timestamp: -1 });

module.exports = {
  LocationLog: mongoose.model('LocationLog', LocationLogSchema),
  LOCATION_STATUSES,
};
