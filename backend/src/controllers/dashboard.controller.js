const dashboardService = require('../services/dashboard.service');

class DashboardController {
  // GET /api/dashboard/stats
  async getDashboardStats(req, res, next) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/dashboard/revenue-trend
  async getRevenueTrend(req, res, next) {
    try {
      const days = req.query.days ? parseInt(req.query.days, 10) : 7;
      const trend = await dashboardService.getRevenueTrend(days);
      return res.status(200).json({
        success: true,
        data: trend,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/dashboard/performance
  async getVehiclePerformance(req, res, next) {
    try {
      const performance = await dashboardService.getVehiclePerformanceLeaderboard();
      return res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
