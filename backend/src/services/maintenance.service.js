const mongoose = require('mongoose');
const {
  Maintenance,
  SERVICE_TYPES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
} = require('../models/Maintenance');
const vehicleService = require('./vehicle.service');
const { lifecycleService } = require('./lifecycle.service');

// In-memory fallback for offline testing environments
let inMemoryMaintenance = [];

class MaintenanceService {
  /**
   * Reset in-memory store (used for test teardown)
   */
  _resetInMemory() {
    inMemoryMaintenance = [];
  }

  /**
   * Create a new maintenance work order
   */
  async createMaintenance(data, user = {}) {
    const {
      vehicleId,
      serviceType = 'ROUTINE_SERVICE',
      problemDescription,
      priority = 'MEDIUM',
      status = 'SCHEDULED',
      estimatedCost,
      actualCost = 0,
      startDate,
      estimatedCompletionDate,
      serviceProvider = 'In-House Workshop',
      performedBy = '',
      notes = '',
    } = data;

    if (!vehicleId) {
      const error = new Error('Vehicle ID is required');
      error.statusCode = 400;
      throw error;
    }

    if (!problemDescription || !problemDescription.trim()) {
      const error = new Error('Problem description is required');
      error.statusCode = 400;
      throw error;
    }

    if (estimatedCost === undefined || estimatedCost === null || Number(estimatedCost) < 0) {
      const error = new Error('A valid non-negative estimated cost is required');
      error.statusCode = 400;
      throw error;
    }

    const normPriority = priority.toUpperCase().trim();
    if (!MAINTENANCE_PRIORITIES.includes(normPriority)) {
      const error = new Error(`Invalid priority '${priority}'. Allowed: ${MAINTENANCE_PRIORITIES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const normStatus = status.toUpperCase().trim();
    if (!MAINTENANCE_STATUSES.includes(normStatus)) {
      const error = new Error(`Invalid status '${status}'. Allowed: ${MAINTENANCE_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const normServiceType = serviceType.toUpperCase().trim();
    if (!SERVICE_TYPES.includes(normServiceType)) {
      const error = new Error(`Invalid service type '${serviceType}'. Allowed: ${SERVICE_TYPES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Verify vehicle exists and is active
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    if (vehicle.isActive === false || vehicle.isDeleted === true) {
      const error = new Error('Cannot schedule maintenance on an inactive or deleted vehicle');
      error.statusCode = 400;
      throw error;
    }

    // Check if vehicle is currently RENTED
    if (vehicle.status === 'RENTED' && normStatus === 'IN_PROGRESS') {
      const error = new Error(
        'Vehicle is currently rented to a customer. In-progress maintenance cannot start until vehicle is returned. You may schedule it as SCHEDULED.'
      );
      error.statusCode = 400;
      throw error;
    }

    // Automatic Vehicle Status Update:
    // If request is active (IN_PROGRESS) or immediate service, transition vehicle to MAINTENANCE
    if (normStatus === 'IN_PROGRESS' || normStatus === 'SCHEDULED') {
      if (['AVAILABLE', 'INSPECTION', 'DAMAGED'].includes(vehicle.status)) {
        try {
          await lifecycleService.transitionVehicleStatus(vehicle._id || vehicleId, 'MAINTENANCE', {
            reason: `Maintenance Request: ${problemDescription.trim()}`,
            notes: `Priority: ${normPriority} | Provider: ${serviceProvider}`,
            changedBy: user.name || user.email || 'Fleet Manager',
          });
        } catch (err) {
          console.warn('[MaintenanceService] Could not auto-transition vehicle:', err.message);
        }
      }
    }

    const maintenanceNumber = `MNT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord = {
      maintenanceNumber,
      vehicle: vehicle._id || vehicleId,
      serviceType: normServiceType,
      problemDescription: problemDescription.trim(),
      priority: normPriority,
      status: normStatus,
      estimatedCost: Number(estimatedCost),
      actualCost: Number(actualCost) || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : undefined,
      serviceProvider: serviceProvider.trim(),
      performedBy: performedBy.trim(),
      notes: notes.trim(),
      recordedBy: user.name || user.email || 'Fleet Manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const savedDoc = await Maintenance.create(newRecord);
        const populated = await Maintenance.findById(savedDoc._id).populate('vehicle');
        return populated || savedDoc;
      } catch (err) {
        console.warn('[MaintenanceService] DB save failed, falling back to memory:', err.message);
      }
    }

    // In-memory fallback
    newRecord._id = new mongoose.Types.ObjectId().toString();
    newRecord.vehicle = vehicle;
    inMemoryMaintenance.unshift(newRecord);
    return newRecord;
  }

  /**
   * Get all maintenance requests with optional filtering and pagination
   */
  async getAllMaintenance(queryParams = {}) {
    const {
      status,
      priority,
      serviceType,
      vehicleId,
      search,
      page = 1,
      limit = 50,
    } = queryParams;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (status && status !== 'ALL') query.status = status.toUpperCase();
        if (priority && priority !== 'ALL') query.priority = priority.toUpperCase();
        if (serviceType && serviceType !== 'ALL') query.serviceType = serviceType.toUpperCase();
        if (vehicleId) query.vehicle = vehicleId;

        const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

        let docs = await Maintenance.find(query)
          .populate('vehicle')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          docs = docs.filter((d) => {
            const v = d.vehicle || {};
            return (
              (d.maintenanceNumber && d.maintenanceNumber.toLowerCase().includes(s)) ||
              (d.problemDescription && d.problemDescription.toLowerCase().includes(s)) ||
              (d.serviceProvider && d.serviceProvider.toLowerCase().includes(s)) ||
              (v.registrationNumber && v.registrationNumber.toLowerCase().includes(s)) ||
              (v.make && v.make.toLowerCase().includes(s)) ||
              (v.model && v.model.toLowerCase().includes(s))
            );
          });
        }

        const total = await Maintenance.countDocuments(query);
        return {
          maintenance: docs,
          total,
          page: Number(page),
          limit: Number(limit),
        };
      } catch (err) {
        console.warn('[MaintenanceService] DB query failed, using memory:', err.message);
      }
    }

    // In-memory fallback
    let filtered = [...inMemoryMaintenance];
    if (status && status !== 'ALL') filtered = filtered.filter((m) => m.status === status.toUpperCase());
    if (priority && priority !== 'ALL') filtered = filtered.filter((m) => m.priority === priority.toUpperCase());
    if (serviceType && serviceType !== 'ALL') filtered = filtered.filter((m) => m.serviceType === serviceType.toUpperCase());
    if (vehicleId) {
      filtered = filtered.filter((m) => {
        const vId = m.vehicle?._id ? m.vehicle._id.toString() : m.vehicle?.toString();
        return vId === vehicleId.toString();
      });
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter((d) => {
        const v = d.vehicle || {};
        return (
          (d.maintenanceNumber && d.maintenanceNumber.toLowerCase().includes(s)) ||
          (d.problemDescription && d.problemDescription.toLowerCase().includes(s)) ||
          (d.serviceProvider && d.serviceProvider.toLowerCase().includes(s)) ||
          (v.registrationNumber && v.registrationNumber.toLowerCase().includes(s)) ||
          (v.make && v.make.toLowerCase().includes(s)) ||
          (v.model && v.model.toLowerCase().includes(s))
        );
      });
    }

    return {
      maintenance: filtered,
      total: filtered.length,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * Get single maintenance record by ID
   */
  async getMaintenanceById(id) {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Maintenance.findById(id).populate('vehicle');
        if (doc) return doc;
      } catch (err) {
        console.warn('[MaintenanceService] DB findById error:', err.message);
      }
    }

    const mem = inMemoryMaintenance.find((m) => m._id.toString() === id.toString());
    if (!mem) {
      const error = new Error('Maintenance request not found');
      error.statusCode = 404;
      throw error;
    }
    return mem;
  }

  /**
   * Update maintenance work order details and handle status transitions
   */
  async updateMaintenance(id, updateData, user = {}) {
    const existing = await this.getMaintenanceById(id);
    if (!existing) {
      const error = new Error('Maintenance request not found');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = existing.status;
    const nextStatus = updateData.status ? updateData.status.toUpperCase().trim() : previousStatus;

    if (nextStatus && !MAINTENANCE_STATUSES.includes(nextStatus)) {
      const error = new Error(`Invalid status '${nextStatus}'. Allowed: ${MAINTENANCE_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    if (updateData.priority) {
      const normPri = updateData.priority.toUpperCase().trim();
      if (!MAINTENANCE_PRIORITIES.includes(normPri)) {
        const error = new Error(`Invalid priority '${updateData.priority}'. Allowed: ${MAINTENANCE_PRIORITIES.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      existing.priority = normPri;
    }

    if (updateData.serviceType) {
      const normServ = updateData.serviceType.toUpperCase().trim();
      if (!SERVICE_TYPES.includes(normServ)) {
        const error = new Error(`Invalid service type '${updateData.serviceType}'. Allowed: ${SERVICE_TYPES.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      existing.serviceType = normServ;
    }

    if (updateData.problemDescription) existing.problemDescription = updateData.problemDescription.trim();
    if (updateData.estimatedCost !== undefined) existing.estimatedCost = Number(updateData.estimatedCost);
    if (updateData.actualCost !== undefined) existing.actualCost = Number(updateData.actualCost);
    if (updateData.serviceProvider) existing.serviceProvider = updateData.serviceProvider.trim();
    if (updateData.performedBy !== undefined) existing.performedBy = updateData.performedBy.trim();
    if (updateData.notes !== undefined) existing.notes = updateData.notes.trim();
    if (updateData.estimatedCompletionDate) existing.estimatedCompletionDate = new Date(updateData.estimatedCompletionDate);

    const vehicleId = existing.vehicle?._id || existing.vehicle;

    // Handle Status Transition logic:
    if (previousStatus !== nextStatus) {
      existing.status = nextStatus;

      // 1. Entering IN_PROGRESS: Ensure vehicle is in MAINTENANCE status
      if (nextStatus === 'IN_PROGRESS') {
        const currentVeh = await vehicleService.getVehicleById(vehicleId);
        if (currentVeh && currentVeh.status !== 'MAINTENANCE') {
          if (['AVAILABLE', 'INSPECTION', 'DAMAGED'].includes(currentVeh.status)) {
            await lifecycleService.transitionVehicleStatus(vehicleId, 'MAINTENANCE', {
              reason: `Maintenance in progress: ${existing.problemDescription}`,
              notes: `Work order: ${existing.maintenanceNumber}`,
              changedBy: user.name || user.email || 'Fleet Manager',
            });
          }
        }
      }

      // 2. Marking COMPLETED: Automatically release vehicle back to AVAILABLE
      if (nextStatus === 'COMPLETED') {
        existing.completionDate = new Date();
        if (updateData.actualCost !== undefined) {
          existing.actualCost = Number(updateData.actualCost);
        } else if (existing.actualCost === 0 && existing.estimatedCost > 0) {
          existing.actualCost = existing.estimatedCost;
        }

        const currentVeh = await vehicleService.getVehicleById(vehicleId);
        if (currentVeh && currentVeh.status === 'MAINTENANCE') {
          await lifecycleService.transitionVehicleStatus(vehicleId, 'AVAILABLE', {
            reason: `Maintenance Completed: ${existing.problemDescription}`,
            notes: `Actual repair cost: ₹${existing.actualCost}. Provider: ${existing.serviceProvider}`,
            changedBy: user.name || user.email || 'Fleet Manager',
          });
        }
      }

      // 3. Marking CANCELLED: If vehicle is in MAINTENANCE, revert to AVAILABLE if no other active repairs
      if (nextStatus === 'CANCELLED') {
        const otherActive = await this.hasActiveMaintenance(vehicleId, existing._id);
        if (!otherActive) {
          const currentVeh = await vehicleService.getVehicleById(vehicleId);
          if (currentVeh && currentVeh.status === 'MAINTENANCE') {
            await lifecycleService.transitionVehicleStatus(vehicleId, 'AVAILABLE', {
              reason: `Maintenance cancelled: ${existing.maintenanceNumber}`,
              notes: 'No other active maintenance jobs pending.',
              changedBy: user.name || user.email || 'Fleet Manager',
            });
          }
        }
      }
    }

    existing.updatedAt = new Date();

    if (mongoose.connection.readyState === 1) {
      try {
        const updatedDoc = await Maintenance.findByIdAndUpdate(
          id,
          {
            problemDescription: existing.problemDescription,
            serviceType: existing.serviceType,
            priority: existing.priority,
            status: existing.status,
            estimatedCost: existing.estimatedCost,
            actualCost: existing.actualCost,
            serviceProvider: existing.serviceProvider,
            performedBy: existing.performedBy,
            notes: existing.notes,
            estimatedCompletionDate: existing.estimatedCompletionDate,
            completionDate: existing.completionDate,
          },
          { new: true, runValidators: true }
        ).populate('vehicle');

        return updatedDoc || existing;
      } catch (err) {
        console.warn('[MaintenanceService] DB update error, using memory:', err.message);
      }
    }

    return existing;
  }

  /**
   * Check if a vehicle has any other active or scheduled maintenance work
   */
  async hasActiveMaintenance(vehicleId, excludeMaintenanceId = null) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          vehicle: vehicleId,
          status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
        };
        if (excludeMaintenanceId) query._id = { $ne: excludeMaintenanceId };
        const active = await Maintenance.findOne(query);
        if (active) return true;
      } catch (err) {
        // Fallback
      }
    }

    return inMemoryMaintenance.some((m) => {
      const vId = m.vehicle?._id ? m.vehicle._id.toString() : m.vehicle?.toString();
      if (vId !== vehicleId.toString()) return false;
      if (excludeMaintenanceId && m._id.toString() === excludeMaintenanceId.toString()) return false;
      return ['SCHEDULED', 'IN_PROGRESS'].includes(m.status);
    });
  }

  /**
   * Delete or cancel maintenance record
   */
  async deleteMaintenance(id) {
    const existing = await this.getMaintenanceById(id);
    if (!existing) {
      const error = new Error('Maintenance request not found');
      error.statusCode = 404;
      throw error;
    }

    const vehicleId = existing.vehicle?._id || existing.vehicle;

    if (mongoose.connection.readyState === 1) {
      try {
        await Maintenance.findByIdAndDelete(id);
      } catch (err) {
        console.warn('[MaintenanceService] DB delete failed:', err.message);
      }
    }

    inMemoryMaintenance = inMemoryMaintenance.filter((m) => m._id.toString() !== id.toString());

    // If vehicle was under maintenance, check if any other active work orders exist
    const otherActive = await this.hasActiveMaintenance(vehicleId);
    if (!otherActive) {
      const currentVeh = await vehicleService.getVehicleById(vehicleId);
      if (currentVeh && currentVeh.status === 'MAINTENANCE') {
        try {
          await lifecycleService.transitionVehicleStatus(vehicleId, 'AVAILABLE', {
            reason: `Maintenance record ${existing.maintenanceNumber} removed`,
            notes: 'No other active maintenance jobs.',
            changedBy: 'System / Admin',
          });
        } catch (err) {
          console.warn('[MaintenanceService] Lifecycle release error:', err.message);
        }
      }
    }

    return { success: true, message: 'Maintenance record deleted successfully', maintenanceId: id };
  }

  /**
   * Get maintenance aggregated statistics
   */
  async getMaintenanceStats() {
    const all = await this.getAllMaintenance({ limit: 1000 });
    const records = all.maintenance || [];

    const stats = {
      total: records.length,
      scheduled: records.filter((r) => r.status === 'SCHEDULED').length,
      inProgress: records.filter((r) => r.status === 'IN_PROGRESS').length,
      completed: records.filter((r) => r.status === 'COMPLETED').length,
      cancelled: records.filter((r) => r.status === 'CANCELLED').length,
      totalEstimatedCost: records.reduce((sum, r) => sum + (Number(r.estimatedCost) || 0), 0),
      totalActualCost: records.reduce((sum, r) => sum + (Number(r.actualCost) || 0), 0),
      criticalCount: records.filter((r) => r.priority === 'CRITICAL' && r.status !== 'COMPLETED').length,
      highCount: records.filter((r) => r.priority === 'HIGH' && r.status !== 'COMPLETED').length,
      byServiceType: {},
      byPriority: {},
    };

    records.forEach((r) => {
      stats.byServiceType[r.serviceType] = (stats.byServiceType[r.serviceType] || 0) + 1;
      stats.byPriority[r.priority] = (stats.byPriority[r.priority] || 0) + 1;
    });

    return stats;
  }
}

module.exports = new MaintenanceService();
