import api from './api';

export const dashboardService = {
  // Get consolidated live fleet statistics & revenue KPIs
  getStats: () => api.get('/dashboard/stats'),

  // Get revenue vs maintenance expense trend (default 7 days)
  getRevenueTrend: (days = 7) => api.get('/dashboard/revenue-trend', { params: { days } }),

  // Get vehicle performance ranking and trip metrics
  getVehiclePerformance: () => api.get('/dashboard/performance'),
};

export default dashboardService;
