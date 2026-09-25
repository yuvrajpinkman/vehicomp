const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public route to view ratings for a vehicle
router.get('/vehicle/:vehicleId', ratingController.getVehicleRatings);

// Protected routes for customers
router.post('/', protect, ratingController.submitRating);
router.get('/user/me', protect, ratingController.getUserRatings);
router.get('/rental/:rentalId', protect, ratingController.getRentalRating);

module.exports = router;
