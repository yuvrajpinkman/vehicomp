import API from './api';

/**
 * Service for querying the Vehicle Recommendation Engine
 */
export const getRecommendations = async (criteria = {}, options = {}) => {
  const payload = {
    ...criteria,
    ...(options || {}),
  };
  const response = await API.post('/recommendations', payload);
  return response.data;
};

export default {
  getRecommendations,
};
