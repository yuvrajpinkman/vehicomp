import api from './api';

export const reservationService = {
  // Create a new reservation
  create: (reservationData) => api.post('/reservations', reservationData),

  // Get current customer's reservations
  getMyReservations: () => api.get('/reservations/my'),

  // Get single reservation details by ID
  getById: (id) => api.get(`/reservations/${id}`),

  // Cancel an active reservation
  cancel: (id, reason = '') => api.patch(`/reservations/${id}/cancel`, { reason }),

  // Fetch all reservations (Admin / Fleet Manager)
  getAll: (params = {}) => api.get('/reservations', { params }),
};

export default reservationService;
