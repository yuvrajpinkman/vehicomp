const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rental.controller');
const { protect } = require('../middlewares/auth.middleware');

// Rental API routes
router.post('/start', protect, rentalController.startRental);
router.post('/', protect, rentalController.startRental);
router.get('/active', protect, rentalController.getActiveRentals);
router.get('/my', protect, rentalController.getUserRentals);
router.get('/:id', protect, rentalController.getRentalById);
router.post('/:id/return', protect, rentalController.returnRental);
router.patch('/:id/return', protect, rentalController.returnRental);

module.exports = router;
