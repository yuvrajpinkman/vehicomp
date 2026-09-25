import API from './api';

export const submitRating = async (ratingData) => {
  const response = await API.post('/ratings', ratingData);
  return response.data;
};

export const getVehicleRatings = async (vehicleId) => {
  const response = await API.get(`/ratings/vehicle/${vehicleId}`);
  return response.data;
};

export const getUserRatings = async () => {
  const response = await API.get('/ratings/user/me');
  return response.data;
};

export const getRentalRating = async (rentalId) => {
  const response = await API.get(`/ratings/rental/${rentalId}`);
  return response.data;
};

export default {
  submitRating,
  getVehicleRatings,
  getUserRatings,
  getRentalRating,
};
