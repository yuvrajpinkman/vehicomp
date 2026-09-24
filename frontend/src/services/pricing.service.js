import API from './api';

export const calculatePricing = async (pricingData) => {
  try {
    const res = await API.post('/pricing/calculate', pricingData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};
