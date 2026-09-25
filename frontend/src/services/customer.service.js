import API from './api';

export const getCustomerDashboard = async () => {
  const response = await API.get('/customer/dashboard');
  return response.data;
};

export default {
  getCustomerDashboard,
};
