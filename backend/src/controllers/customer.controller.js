const customerService = require('../services/customer.service');

class CustomerController {
  // GET /api/customer/dashboard
  async getCustomerDashboard(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const dashboard = await customerService.getCustomerDashboard(userId);
      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
