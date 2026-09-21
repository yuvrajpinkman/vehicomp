import api from './api';

export const maintenanceService = {
  // Query all maintenance requests with optional filters
  getAll: (params = {}) => api.get('/maintenance', { params }),

  // Get single maintenance record by ID
  getById: (id) => api.get(`/maintenance/${id}`),

  // Create new maintenance work order
  create: (data) => api.post('/maintenance', data),

  // Update existing maintenance request
  update: (id, data) => api.put(`/maintenance/${id}`, data),

  // Delete maintenance request
  delete: (id) => api.delete(`/maintenance/${id}`),

  // Get aggregated maintenance statistics
  getStats: () => api.get('/maintenance/stats'),

  // Get allowed options and metadata (service types, priorities, statuses)
  getMeta: () => api.get('/maintenance/meta'),

  // Get maintenance history for a specific vehicle
  getByVehicleId: (vehicleId) => api.get(`/maintenance/vehicle/${vehicleId}`),
};

export default maintenanceService;
