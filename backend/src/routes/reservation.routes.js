const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { protect } = require('../middlewares/auth.middleware');

// Reservation API routes
router.post('/', protect, reservationController.createReservation);
router.get('/', protect, reservationController.getReservations);
router.get('/my', protect, reservationController.getUserReservations);
router.get('/:id', protect, reservationController.getReservationById);
router.patch('/:id/cancel', protect, reservationController.cancelReservation);

module.exports = router;
