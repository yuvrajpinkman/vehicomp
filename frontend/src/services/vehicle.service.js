import api from './api';

export const vehicleService = {
  // Fetch vehicles with optional filtering
  getAll: (params = {}) => api.get('/vehicles', { params }),

  // Fetch single vehicle details
  getById: (id) => api.get(`/vehicles/${id}`),

  // Create new vehicle
  create: (vehicleData) => api.post('/vehicles', vehicleData),

  // Update vehicle details
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),

  // Update vehicle status
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status }),

  // Toggle active/inactive state (deactivate)
  toggleActive: (id, isActive) => api.patch(`/vehicles/${id}/deactivate`, { isActive }),

  // Soft delete vehicle
  delete: (id) => api.delete(`/vehicles/${id}`),

  // Check vehicle availability for date range
  checkAvailability: (id, startDate, endDate) =>
    api.get(`/vehicles/${id}/availability`, { params: { startDate, endDate } }),
};

export default vehicleService;
