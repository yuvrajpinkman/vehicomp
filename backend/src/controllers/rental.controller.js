const rentalService = require('../services/rental.service');

class RentalController {
  // POST /api/rentals/start
  async startRental(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || req.body.userId || '65f1a2b3c4d5e6f7a8b9c099';
      const rental = await rentalService.startRental(req.body, userId);

      return res.status(201).json({
        success: true,
        message: 'Rental started successfully. Vehicle is now RENTED.',
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/rentals/active
  async getActiveRentals(req, res, next) {
    try {
      const userId = req.query.userId || (req.user?.role === 'CUSTOMER' ? (req.user.id || req.user._id) : null);
      const rentals = await rentalService.getActiveRentals(userId);

      return res.status(200).json({
        success: true,
        count: rentals.length,
        data: rentals,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/rentals/my
  async getUserRentals(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || req.query.userId || '65f1a2b3c4d5e6f7a8b9c099';
      const rentals = await rentalService.getUserRentals(userId);

      return res.status(200).json({
        success: true,
        count: rentals.length,
        data: rentals,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/rentals/:id
  async getRentalById(req, res, next) {
    try {
      const rental = await rentalService.getRentalById(req.params.id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental record not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/rentals/:id/return
  async returnRental(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || 'System';
      const rental = await rentalService.returnRental(req.params.id, req.body, userId);

      return res.status(200).json({
        success: true,
        message: 'Vehicle returned successfully. Status updated to RETURNED.',
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RentalController();
