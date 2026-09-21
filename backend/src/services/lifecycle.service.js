const { Vehicle, VEHICLE_STATUSES } = require('../models/Vehicle');

/**
 * Strict state transition matrix for fleet vehicle lifecycle
 */
const LIFECYCLE_TRANSITIONS = {
  AVAILABLE: ['RESERVED', 'MAINTENANCE'],
  RESERVED: ['RENTED', 'AVAILABLE'],
  RENTED: ['RETURNED'],
  RETURNED: ['INSPECTION', 'DAMAGED'],
  INSPECTION: ['AVAILABLE', 'DAMAGED', 'MAINTENANCE'],
  DAMAGED: ['MAINTENANCE'],
  MAINTENANCE: ['AVAILABLE', 'INSPECTION'],
};

/**
 * Descriptive human-readable explanations of each transition
 */
const TRANSITION_DESCRIPTIONS = {
  'AVAILABLE->RESERVED': 'Customer created a reservation',
  'AVAILABLE->MAINTENANCE': 'Vehicle scheduled for routine service or inspection',
  'RESERVED->RENTED': 'Vehicle picked up and rental period commenced',
  'RESERVED->AVAILABLE': 'Reservation cancelled; vehicle returned to inventory',
  'RENTED->RETURNED': 'Vehicle dropped off by customer; awaiting inspection',
  'RETURNED->INSPECTION': 'Post-rental return inspection commenced',
  'RETURNED->DAMAGED': 'Damage flagged upon return',
  'INSPECTION->AVAILABLE': 'Vehicle cleared inspection in good condition',
  'INSPECTION->DAMAGED': 'Inspection detected vehicle damage requiring repair',
  'INSPECTION->MAINTENANCE': 'Inspection detected servicing or minor repair requirements',
  'DAMAGED->MAINTENANCE': 'Vehicle transferred to workshop for repairs',
  'MAINTENANCE->AVAILABLE': 'Repairs and servicing completed successfully',
  'MAINTENANCE->INSPECTION': 'Post-maintenance quality assurance check',
};

class LifecycleService {
  /**
   * Check if a transition between two statuses is valid
   */
  isValidTransition(currentStatus, nextStatus) {
    const allowed = LIFECYCLE_TRANSITIONS[currentStatus];
    return Array.isArray(allowed) && allowed.includes(nextStatus);
  }

  /**
   * Get all allowed next transitions for a current status
   */
  getAllowedTransitions(currentStatus) {
    return LIFECYCLE_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Get full lifecycle rules matrix
   */
  getRules() {
    return {
      transitions: LIFECYCLE_TRANSITIONS,
      descriptions: TRANSITION_DESCRIPTIONS,
      allStatuses: VEHICLE_STATUSES,
    };
  }

  /**
   * Execute a validated vehicle status transition
   */
  async transitionVehicleStatus(vehicleId, nextStatus, metadata = {}) {
    const targetStatus = nextStatus.toUpperCase().trim();

    if (!VEHICLE_STATUSES.includes(targetStatus)) {
      const error = new Error(`Invalid status: '${targetStatus}'. Allowed statuses: ${VEHICLE_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    const currentStatus = vehicle.status;

    // Reject self-transitions
    if (currentStatus === targetStatus) {
      const error = new Error(`Vehicle is already in status '${currentStatus}'`);
      error.statusCode = 400;
      throw error;
    }

    // Validate transition
    if (!this.isValidTransition(currentStatus, targetStatus)) {
      const allowed = this.getAllowedTransitions(currentStatus);
      const error = new Error(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. ` +
        (allowed.length > 0
          ? `Allowed next states from '${currentStatus}': [${allowed.join(', ')}]`
          : `No outgoing transitions permitted from '${currentStatus}'.`)
      );
      error.statusCode = 400;
      throw error;
    }

    const defaultReason = TRANSITION_DESCRIPTIONS[`${currentStatus}->${targetStatus}`] || `Transition to ${targetStatus}`;
    const historyEntry = {
      fromStatus: currentStatus,
      toStatus: targetStatus,
      reason: metadata.reason || defaultReason,
      notes: metadata.notes || '',
      changedBy: metadata.changedBy || 'System/Admin',
      timestamp: new Date(),
    };

    vehicle.status = targetStatus;
    vehicle.statusChangedAt = new Date();
    if (!vehicle.statusHistory) {
      vehicle.statusHistory = [];
    }
    vehicle.statusHistory.push(historyEntry);

    await vehicle.save();

    return {
      vehicle,
      transition: historyEntry,
      allowedNextTransitions: this.getAllowedTransitions(targetStatus),
    };
  }

  /**
   * Get lifecycle history log for a vehicle
   */
  async getVehicleHistory(vehicleId) {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: false }).select(
      'registrationNumber make model status statusChangedAt statusHistory'
    );

    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      vehicleId: vehicle._id,
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      currentStatus: vehicle.status,
      statusChangedAt: vehicle.statusChangedAt,
      allowedNextTransitions: this.getAllowedTransitions(vehicle.status),
      history: (vehicle.statusHistory || []).reverse(), // Newest first
    };
  }
}

module.exports = {
  lifecycleService: new LifecycleService(),
  LIFECYCLE_TRANSITIONS,
  TRANSITION_DESCRIPTIONS,
};
