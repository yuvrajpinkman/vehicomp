import api from './api';

export const rentalService = {
  // Start a new rental
  startRental: (rentalData) => api.post('/rentals/start', rentalData),

  // Get active rentals (customer or fleet manager)
  getActiveRentals: () => api.get('/rentals/active'),

  // Get current customer's rental history
  getMyRentals: () => api.get('/rentals/my'),

  // Get single rental details by ID
  getById: (id) => api.get(`/rentals/${id}`),

  // Return a vehicle (completes rental & calculates late fees)
  returnRental: (id, returnData) => api.post(`/rentals/${id}/return`, returnData),
};

export default rentalService;
