import API from './api';

export const getFleetLocations = async () => {
  const response = await API.get('/location/fleet');
  return response.data;
};

export const getVehicleLocation = async (vehicleId) => {
  const response = await API.get(`/location/vehicle/${vehicleId}`);
  return response.data;
};

export const getVehicleLocationHistory = async (vehicleId, limit = 50) => {
  const response = await API.get(`/location/vehicle/${vehicleId}/history?limit=${limit}`);
  return response.data;
};

export const simulateMovement = async (vehicleId, stepSize = 0.002) => {
  const response = await API.post(`/location/simulate/${vehicleId}`, { stepSize });
  return response.data;
};

export const updateLocation = async (telemetry) => {
  const response = await API.post('/location/update', telemetry);
  return response.data;
};

export default {
  getFleetLocations,
  getVehicleLocation,
  getVehicleLocationHistory,
  simulateMovement,
  updateLocation,
};
