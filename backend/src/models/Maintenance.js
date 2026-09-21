const mongoose = require('mongoose');

const SERVICE_TYPES = [
  'ROUTINE_SERVICE',
  'REPAIR',
  'INSPECTION',
  'OIL_CHANGE',
  'TIRE_ROTATION',
  'BRAKE_SERVICE',
  'ACCIDENT_REPAIR',
  'BODY_WORK',
  'BATTERY_SERVICE',
  'OTHER',
];

const MAINTENANCE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const MAINTENANCE_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const MaintenanceSchema = new mongoose.Schema(
  {
    maintenanceNumber: {
      type: String,
      required: [true, 'Maintenance work order number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle ID is required'],
    },
    serviceType: {
      type: String,
      enum: {
        values: SERVICE_TYPES,
        message: '{VALUE} is not a valid service type',
      },
      default: 'ROUTINE_SERVICE',
      uppercase: true,
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: MAINTENANCE_PRIORITIES,
        message: '{VALUE} is not a valid priority',
      },
      default: 'MEDIUM',
      uppercase: true,
    },
    status: {
      type: String,
      enum: {
        values: MAINTENANCE_STATUSES,
        message: '{VALUE} is not a valid maintenance status',
      },
      default: 'SCHEDULED',
      uppercase: true,
    },
    estimatedCost: {
      type: Number,
      required: [true, 'Estimated cost is required'],
      min: [0, 'Estimated cost cannot be negative'],
    },
    actualCost: {
      type: Number,
      default: 0,
      min: [0, 'Actual cost cannot be negative'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    estimatedCompletionDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    serviceProvider: {
      type: String,
      default: 'In-House Workshop',
      trim: true,
    },
    performedBy: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    recordedBy: {
      type: String,
      default: 'Fleet Manager',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying & dashboard calculations
MaintenanceSchema.index({ vehicle: 1, status: 1 });
MaintenanceSchema.index({ status: 1, priority: 1 });
MaintenanceSchema.index({ createdAt: -1 });

module.exports = {
  Maintenance: mongoose.model('Maintenance', MaintenanceSchema),
  SERVICE_TYPES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
};
