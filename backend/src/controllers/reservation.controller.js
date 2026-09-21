const reservationService = require('../services/reservation.service');

class ReservationController {
  // POST /api/reservations
  async createReservation(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || req.body.userId || '65f1a2b3c4d5e6f7a8b9c099';
      const reservation = await reservationService.createReservation(req.body, userId);

      return res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reservations
  async getReservations(req, res, next) {
    try {
      const reservations = await reservationService.getReservations(req.query);
      return res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reservations/my
  async getUserReservations(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || req.query.userId || '65f1a2b3c4d5e6f7a8b9c099';
      const reservations = await reservationService.getUserReservations(userId);
      return res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reservations/:id
  async getReservationById(req, res, next) {
    try {
      const reservation = await reservationService.getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/reservations/:id/cancel
  async cancelReservation(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || req.body.userId || '65f1a2b3c4d5e6f7a8b9c099';
      const { reason } = req.body;
      const reservation = await reservationService.cancelReservation(req.params.id, userId, reason);

      return res.status(200).json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservationController();
